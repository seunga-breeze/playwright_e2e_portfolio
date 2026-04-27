import { type Page, type Locator, test, expect } from '@playwright/test';
import { TIMEOUTS } from '../Utils';
import stepConfig from './config/stepConfig.json';
import { TradeInData, ParsedTradeInValue, StepConfig, StepMethod } from './TradeInTypes';

interface CartSelectorConfig {
  deviceOptionSelectBox: (value: string) => string;
  deviceOptionSelector: (value: string) => string;
  deviceCategorySelector: (value: string) => string;
  btnContinueAndApply: string;
  inputImei: string;
  conditionRow: string;
  conditionOption: string;
  tncCheckbox: string;
}

export class TradeInCart {
  private readonly stepMethods: Record<string, StepMethod>;
  private readonly siteCode: string;
  private readonly s: CartSelectorConfig;
  private readonly config: any;
  private readonly tncCheckbox: Locator;
  private readonly btnContinueAndApply: Locator;
  private readonly inputImei: Locator;
  private readonly conditionRow: Locator;
  private readonly conditionOption: Locator;

  constructor(public readonly page: Page) {
    // Get config from current test metadata using test.info()
    this.config = test.info().project.metadata;
    const rawSiteCode = this.config?.siteCode || 'default';
    this.siteCode = rawSiteCode.toUpperCase();
    console.log(`[TradeInCart] Site code: '${this.siteCode}' (from: '${rawSiteCode}')`);
    
    this.s = this.getCartSelectors();
    
    // Initialize locators
    this.tncCheckbox = this.page.locator(this.s.tncCheckbox);
    this.btnContinueAndApply = this.page.locator(this.s.btnContinueAndApply);
    this.inputImei = this.page.locator(this.s.inputImei);
    this.conditionRow = this.page.locator(this.s.conditionRow);
    this.conditionOption = this.page.locator(this.s.conditionOption);
    
    // Map step methods
    this.stepMethods = {
      skipGuide: this.executeSkipGuide.bind(this),
      selectDevice: this.executeSelectDevice.bind(this),
      condition: this.executeCondition.bind(this),
      imei: this.executeIMEI.bind(this),
      apply: this.executeApply.bind(this)
    };
  }

  private getCartSelectors(): CartSelectorConfig {
    // Default selectors
    const defaultSelectors: CartSelectorConfig = {
      // Device option select box
      deviceOptionSelectBox: (value: string) => [        
        `mat-form-field:has(input#modelSelection[data-an-la*="null"])`,
        `mat-accordion[data-an-la*="null"]`,
        `mat-accordion[data-an-la*="${value}"]`,
        `.trade-in-modal .mat-accordion`
      ].join(', '),

      // Device option selector
      deviceOptionSelector: (value: string) => [        
        `mat-accordion:has([data-an-la='trade-in:select device:${value}' i])`,
        `li.trade-in__dropdown-option.ng-star-inserted:has-text("${value}")`
      ].join(', '),

      // Device category selector
      deviceCategorySelector: (value: string) => `[data-an-la='trade-in:select device:${value}'i]`,

      // Continue/Apply button
      btnContinueAndApply: [
        `.button.primary.pill-btn.pill-btn--black[data-an-la^="trade-in:"]`,
        `[data-an-la="trade-in:trade-in guide:next"]`,
        `.button.primary.pill-btn.pill-btn--blue.view-more`
      ].join(', '),
      
      // IMEI input field
      inputImei: 'input[formcontrolname="imeiFormControl"]',
      
      // Condition row
      conditionRow: '.condition-radio', 
      
      // Condition option
      conditionOption: '.condition-radio__button.condition-radio__yes',
      
      // Terms and conditions checkbox
      tncCheckbox: '[formcontrolname="tnc"] .mdc-checkbox:has(input:not(:checked))'
    };

    // Site-specific selector overrides
    const siteSpecificSelectors: Record<string, Partial<CartSelectorConfig>> = {
      SG: {
        // SG-specific selectors (add when needed)
        // deviceOptionSelectBox: (value: string) => `sg-specific-selector:has([data-an-la*="${value}"])`,
      },
      UK: {
        // UK-specific selectors (add when needed)
        deviceOptionSelectBox: (value: string) => `mat-form-field:has([data-an-la*="null"])`,
        deviceOptionSelector: (value: string) => `mat-option:has(span.tradein-text:has-text("${value}"))`,
      },
      // Add other sites when needed
    };

    // Override with site-specific selectors if available, otherwise use default
    const siteSelectors = siteSpecificSelectors[this.siteCode] || {};
    
    // Log: Check which selectors are being used
    const overriddenSelectors = Object.keys(siteSelectors);
    if (overriddenSelectors.length > 0) {
      console.log(`[${this.siteCode}] Using site-specific selectors for: ${overriddenSelectors.join(', ')}`);
    } else {
      console.log(`[${this.siteCode}] Using default selectors for all elements`);
    }
    
    return {
      ...defaultSelectors,
      ...siteSelectors
    };
  }

  private getStepsForSite(): string[] {
    console.log(`[${this.siteCode}] Config loaded:`, stepConfig);
    console.log(`[${this.siteCode}] Available sites:`, Object.keys(stepConfig));
    
    const config = stepConfig as StepConfig;
    const siteConfig = config[this.siteCode];
    const defaultConfig = config.default;
    
    console.log(`[${this.siteCode}] Site config:`, siteConfig);
    console.log(`[${this.siteCode}] Default config:`, defaultConfig);
    
    const finalSteps = (siteConfig && siteConfig.CART) || defaultConfig.CART;
    
    console.log(`[${this.siteCode}] Final steps:`, finalSteps);
    
    if (!Array.isArray(finalSteps)) {
      throw new Error(`Steps configuration is not an array for site '${this.siteCode}'. Got: ${typeof finalSteps}`);
    }
    
    return finalSteps;
  }

  async process(data: TradeInData): Promise<void> {
    console.log(`[${this.siteCode}] Starting Trade-in process...`);
    
    try {
      const steps = this.getStepsForSite();
      console.log(`[${this.siteCode}] Executing steps:`, steps);

      for (const stepName of steps) {
        console.log(`[${this.siteCode}] Executing step: ${stepName}`);
        
        // Execute step
        await this.stepMethods[stepName](data);
        
        // Define steps to skip button click (if empty, click button in all steps)
        const skipButtonSteps: string[] = [];
        
        if (!skipButtonSteps.includes(stepName)) {
          try {
            await this.btnContinueAndApply.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
            await this.clickButton(this.btnContinueAndApply, 'Continue and Apply');
          } catch (error) {
            console.log(`[${this.siteCode}] Continue and Apply button is not visible or clickable:`, error);
          }
        }
        
        await this.page.waitForTimeout(2000);
      }

      console.log(`[${this.siteCode}] All steps completed successfully!`);
    } catch (error: unknown) {
      console.error(`[${this.siteCode}] Process failed:`, error);
      throw error;
    }
  }

  // Cart-specific step implementations
  private async executeSkipGuide(data: TradeInData): Promise<void> {
    try {
      console.log(`[${this.siteCode}] Skip guide completed`);
    } catch (error: unknown) {
      console.log(`[${this.siteCode}] Skip guide failed, continuing...`);
    }
  }

  private async executeSelectDevice(data: TradeInData): Promise<void> {
    const allowedSelectKeys = ['zipCode', 'brand', 'model', 'series', 'subseries', 'device', 'storage', 'color', 'purchaseFrom'];
    
    if (data.category && data.category.trim()) {
      await this.selectCategory(data.category);
    }
    
    for (const key of allowedSelectKeys) {
      if (data[key as keyof TradeInData] && (data[key as keyof TradeInData] as string).trim()) {
        await this.selectOption(data[key as keyof TradeInData] as string);
      }
    }
    console.log(`[${this.siteCode}] Device selection completed`);
  }

  private async executeCondition(data: TradeInData): Promise<void> {
    if (await this.selectBestDeviceConditions()) {
      await this.acceptTermsAndConditions();
    }
    console.log(`[${this.siteCode}] Condition selection completed`);
  }

  private async executeIMEI(data: TradeInData): Promise<void> {
    await this.enterIMEI(data);
    await this.acceptTermsAndConditions();
    console.log(`[${this.siteCode}] IMEI step completed`);
  }

  private async executeApply(data: TradeInData): Promise<void> {
    console.log(`[${this.siteCode}] Apply step completed`);
  }

  // Cart-specific helper methods
  async selectCategory(value: string): Promise<void> {
    const categoryLocator = this.page.locator(this.s.deviceCategorySelector(value));
    
    try {
      await categoryLocator.waitFor({ state: 'visible', timeout: 5000});
      await categoryLocator.click();
    } catch (error: unknown) {
      console.error(`[${this.siteCode}] Category selection failed for "${value}":`, error);
      throw error;
    }
  }

  async selectOption(value: string): Promise<void> {
    // Get container (visible and enabled elements)
    const container = this.page.locator(this.s.deviceOptionSelectBox(value)).locator(':not([disabled])').first();
    const optionSelector = this.page.locator(this.s.deviceOptionSelector(value)).first();
    
    try {
      console.log(`[${this.siteCode}] Looking for select box for value: "${value}"`);
      console.log(`[${this.siteCode}] Box selector: ${this.s.deviceOptionSelectBox(value)}`);
      
      // Force delay 1 second
      await this.page.waitForTimeout(1000);
      await container.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`[${this.siteCode}] Container found and visible`);

      // Check if dropdown is open
      const isOpen = await container.locator('[aria-expanded="true"]').count() > 0;
      
      if (!isOpen) {
        console.log(`[${this.siteCode}] Opening dropdown...`);
        await container.click();
        await this.page.waitForTimeout(1000);
      } else {
        console.log(`[${this.siteCode}] Dropdown already open`);
      }
        
      console.log(`[${this.siteCode}] Looking for option: "${value}"`);
      console.log(`[${this.siteCode}] Option selector: ${this.s.deviceOptionSelector(value)}`);
      
      await optionSelector.waitFor({ state: 'visible', timeout: 5000 });
      console.log(`[${this.siteCode}] Option found and visible`);
      
      await optionSelector.click();
      console.log(`[${this.siteCode}] Option "${value}" selected successfully`);
    } catch (error: unknown) {
      console.error(`[${this.siteCode}] Option selection failed for "${value}":`, error);
      throw error;
    }
  }

  async selectBestDeviceConditions(timeoutMs = 30_000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    let clicked = 0;

    while (Date.now() < deadline) {
      const uncheckedRows = this.conditionRow.filter({
        hasNot: this.page.locator("input:checked")
      });
      const visibleRowCount = await uncheckedRows.filter({ visible: true }).count();

      if (visibleRowCount === 0) break;

      const success = await this.clickFirstOption(uncheckedRows.first());
      if (success) clicked++;
      else break;

      await this.page.waitForTimeout(300);
    }

    return clicked > 0;
  }

  private async clickFirstOption(row: Locator, maxRetries = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const firstOption = row.locator(this.conditionOption).first();
        await firstOption.scrollIntoViewIfNeeded();
        await firstOption.click();
        return true;
      } catch (error: unknown) {
        if (attempt < maxRetries) {
          await this.page.waitForTimeout(200 * attempt);
        }
      }
    }
    return false;
  }

  async acceptTermsAndConditions(timeoutMs: number = 30_000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    let clicked = 0;

    while (Date.now() < deadline) {
      const visibleCheckboxes = this.tncCheckbox.filter({ visible: true });
      const visibleCount = await visibleCheckboxes.count();
      
      if (visibleCount === 0) break;

      try {
        const firstCheckbox = visibleCheckboxes.first();
        await firstCheckbox.click();
        clicked++;
        await this.page.waitForTimeout(100);
      } catch (error: unknown) {
        console.error(`[${this.siteCode}] T&C checkbox visible but click failed:`, error);
        throw new Error(`[${this.siteCode}] T&C checkbox visible but click failed: ${error}`);
      }
    }

    return clicked > 0;
  }

  async enterIMEI(data: TradeInData): Promise<void> {
    if (!data.IMEI || !(await this.inputImei.isVisible({ timeout: 5000 }))) return;
    
    try {
      await this.inputImei.fill(data.IMEI);
      await this.inputImei.press('Enter');
    } catch (error: unknown) {
      console.error(`[${this.siteCode}] IMEI failed for "${data.IMEI}":`, error);
      throw error;
    }
  }

  async clickButton(selector: string | Locator, buttonType: string = 'Button'): Promise<void> {
    const buttons = typeof selector === 'string' ? this.page.locator(selector) : selector;
    const count = await buttons.count();
    
    if (count === 0) {
      throw new Error(`[${this.siteCode}] No ${buttonType} button found`);
    }
    
    try {
      // Find and click the first ready button
      const checks = Array.from({ length: count }, async (_, i) => {
        const button = buttons.nth(i);
        
        // Wait for visible and enabled state simultaneously
        await Promise.all([
          button.waitFor({ state: 'visible', timeout: 10000 }),
          expect(button).toBeEnabled({ timeout: 15000 })
        ]);
        
        return { button, index: i };
      });

      const winner = await Promise.race(checks);
      console.log(`[${this.siteCode}] Button ${winner.index + 1} clicked successfully`);
      await winner.button.click();
    } catch (error: unknown) {
      throw new Error(`[${this.siteCode}] No clickable ${buttonType} button found`);
    }
  }


  

  // Cart-specific trade-in value methods
  async getTradeInDiscountValue(sku: string): Promise<string> {
    const selectors = [
      // Cart page selector (SKU required)
      `.cart-item[data-modelcode="${sku}"] [data-modelcode="TRADE-IN"]:not(.service-item__trade-up) .trade-in__item-discount`,
    ] as const;
    
    // Return text of first visible element (early return)
    for (const selector of selectors) {
      try {
        console.log(`[${this.siteCode}] Trying Cart selector: ${selector}`);
        await this.page.waitForTimeout(3000);
        const element = this.page.locator(selector).first();
        // Fast failure handling with short timeout (1 second)
        if (await element.isVisible({ timeout: 10000 })) {
          const text = await element.textContent();
          if (text?.trim()) {
            console.log(`[${this.siteCode}] Trade-in value found with Cart selector: ${selector}`);
            return text.trim();
          } else {
            console.log(`[${this.siteCode}] Element found but no text content: ${selector}`);
          }
        } else {
          console.log(`[${this.siteCode}] Element not visible: ${selector}`);
        }
      } catch (error) {
        console.log(`[${this.siteCode}] Cart selector failed: ${selector} - Error: ${error}`);
        // Continue to next if individual selector fails
        continue;
      }
    }
    
     console.log(`[${this.siteCode}] No trade-in discount value found (Cart)`);
     return '';
   }

  async parseTradeInValue(tradeInText: string): Promise<ParsedTradeInValue> {
    // Input validation
    if (!tradeInText?.trim()) {
      throw new Error(`Cart - tradeInText is required`);
    }

    const currency = this.config.currencyMark || this.config.currencyCode;
    const cleanText = tradeInText.trim();
    
    // Simple regex for currency symbol + number pattern matching (negative allowed)
    const escapedCurrency = currency.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = cleanText.match(new RegExp(`^-?${escapedCurrency}([\\d,]+(?:\\.\\d{2})?)$`));
    
    if (!match) {
      throw new Error(`Cart - Invalid format: expected "${currency}123.45" or "-${currency}123.45", got "${cleanText}"`);
    }

    const cleanAmount = match[1].replace(/,/g, '');
    const amount = Number(cleanAmount);
    
    if (!Number.isFinite(amount)) {
      throw new Error(`Cart - Invalid number: "${match[1]}"`);
    }

    return {
      currency: currency,
      amount,
      amountString: cleanAmount,
      amountStringNoDecimal: cleanAmount.replace(/\./g, ''),
      originalText: cleanText
    };
  }

  async getAndParseTradeInValue(sku: string): Promise<ParsedTradeInValue> {
    return await this.parseTradeInValue(await this.getTradeInDiscountValue(sku));
  }

  // Cart-specific validation methods
  async verifyNotNull(actual: string | null | undefined): Promise<void> {
    const softExpect = expect.configure({ soft: true });
    
    // null check
    await softExpect(actual, `Cart - Value is null`).not.toBeNull();
    
    if (actual != null) {
      // empty check
      await softExpect(actual.trim().length, `Cart - Value is empty`).toBeGreaterThan(0);
    }
    
    console.log(`Cart - Not null validation passed: '${actual}'`);
  }

  async verifyNumericValue(actual: string | null | undefined): Promise<void> {
    const softExpect = expect.configure({ soft: true });
    
    if (actual != null) {
      // Check numeric content
      const numericContent = actual.replace(/[^\d]/g, '');
      await softExpect(numericContent.length, `Cart - No numeric content in value: '${actual}'`).toBeGreaterThan(0);
    }
    
    console.log(`Cart - Numeric validation passed: '${actual}'`);
  }

  async verifyCurrencyMarkOrCode({
    actualText,
    currencyMark,
    currencyCode,
    currentSite,
    excludedSites = []
  }: {
    actualText: string;
    currencyMark?: string;
    currencyCode?: string;
    currentSite: string;
    excludedSites?: string[];
  }): Promise<void> {
    const softExpect = expect.configure({ soft: true });
    // Check excluded sites
    if (excludedSites.includes(currentSite)) {
      console.log(`Currency validation skipped for excluded site: ${currentSite}`);
      return;
    }
    
    // Check required parameters
    if (!actualText || !currentSite) {
      console.error(`Missing required parameters: actualText or currentSite`);
      return;
    }
    
    // Either Mark or Code must be provided
    if (!currencyMark && !currencyCode) {
      console.error(`Either currencyMark or currencyCode must be provided (site: ${currentSite})`);
      return;
    }
    
     // Execute validation
     const actualValue = actualText.trim();
     let isValid = false;
     const attempts: string[] = [];
     
     // Mark validation (check if currency symbol is included in originalText)
     if (currencyMark) {
       const markMatch = actualValue.includes(currencyMark.trim());
       if (markMatch) isValid = true;
       attempts.push(`mark:'${currencyMark}'${markMatch ? 'OK' : 'FAIL'}`);
     }
     
     // Code validation (check if currency code is included in originalText, case insensitive)
     if (currencyCode && !isValid) {
       const codeMatch = actualValue.toUpperCase().includes(currencyCode.trim().toUpperCase());
       if (codeMatch) isValid = true;
       attempts.push(`code:'${currencyCode}'${codeMatch ? 'OK' : 'FAIL'}`);
     }
    
    // Process result
    const attemptSummary = attempts.join(', ');
    await softExpect(isValid, 
      `Cart Trade-in currency validation - Site: ${currentSite}, Actual: '${actualValue}', Expected: ${attemptSummary}`
    ).toBe(true);
    
    if (isValid) {
      console.log(`Cart Trade-in currency validation - Site: ${currentSite}, Currency validation passed: '${actualValue}' (${attemptSummary})`);
    }
  }
}
