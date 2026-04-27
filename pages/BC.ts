import { Page, Locator, expect } from '@playwright/test';
import { ProtectionPlanPage } from './ProtectionPlan';
import { Utils, DELAYS, TIMEOUTS } from './Utils';
import { TradeInBC } from './TradeIn/TradeInBC';
import { TradeInData } from './TradeIn/TradeInTypes';
import { AddonPage } from './Addon';
import { Cart } from './Cart';
import { SIMPage } from './SIM';
import { InstallmentPlanPage } from './InstallmentPlan';
import { ProjectConfig, TradeInDevice, TradeInDeviceGroup } from '../types/config';

type OptionType = 'device' | 'color' | 'storage' | 'connectivity';
type WatchOptionType = 'watchDevice' | 'watchCaseColor' | 'watchCaseSize' | 'watchConnectivity';
type BookOptionType = 'bookStorage' | 'bookConnectivity' | 'bookOS' | 'bookMemory' | 'bookScreen' | 'bookProcessor' | 'bookGraphics';
type PriceType = 'device' | 'storage' | 'watchDevice' | 'bookStoragePrice' | 'bookMemoryPrice';
const optionSelectors: Record<OptionType, (value: string) => string> = {
  device: (v) =>
    `.s-option-device :has(> input[data-displayname="${v}"i]), .s-option-device :has(> input[data-englishname="${v}"i])`,
  color: (v) =>
    `.s-option-color-special :has(> input[data-englishname*="${v}"i]), .s-option-color-special :has(> input[data-displayname*="${v}"i])`,
  storage: (v) => `.s-option-storage :has(> input[data-englishname*="${v}"i]), .s-option-storage :has(> input[data-displayname*="${v}"i])`,
  connectivity: (v) => `.s-option-connect :has(> input[data-englishname*="${v}"i]), .s-option-connect :has(> input[data-displayname*="${v}"i])`
};

const watchOptionSelectors: Record<WatchOptionType, (value: string) => string> = {
  watchDevice: (v) => [
    `.wearable-option.option-device :has(> input[data-modeldisplay="${v}"i])`,
    `.wearable-option.option-device :has(> input[an-la="device:${v}"i])`
  ].join(', '),
  
  watchCaseColor: (v) => [
    `.option-case-color :has(> [data-modeldisplay="${v}"i])`,
    `.option-case-color :has(> [an-la="case color:${v}"i])`,
    `.s-option-color-special :has(> input[data-displayname*="${v}"i])`,
    `.s-option-color-special :has(> input[data-englishname*="${v}"i])`
  ].join(', '),
  
  watchCaseSize: (v) => [
    `.option-case-size :has(> [data-modeldisplay="${v}"i])`,
    `.hubble-product__options-list :has(> [data-pimsubtype="wearable"][data-englishname="${v}"i])`
  ].join(', '),
  
  watchConnectivity: (v) => [
    `.option-connectivity :has(> [data-modeldisplay="${v}"i])`,
    `.option-connectivity :has(> [an-la="case size:${v}"i])`
  ].join(', ')
};

const bookOptionSelectors: Record<BookOptionType, (value: string) => string> = { 
  bookStorage: (v) => `.s-option-box input[data-displayname="${v}"]`,
  bookConnectivity: (v) => `.s-option-connect :has(>[data-displayname="${v}"i])`,
  bookOS: (v) => `.s-option-sim :has(>[data-displayname="${v}"i])`,
  bookMemory: (v) => `.s-option-storage :has(>[data-displayname="${v}"i][name*="memories-rdo "])`,
  bookScreen: (v) => `.s-option-screen :has(> [data-englishname*="${v}"i]), .s-option-screen :has(> [data-displayname*="${v}"i])`,
  bookProcessor: (v) => `.s-option-processor :has(>[data-displayname*="${v}"i])`,
  bookGraphics: (v) => `.s-option-graphics :has(>[data-displayname="${v}"i])`,
};

const priceSelectors: Record<PriceType, (value: string) => string> = {
  device: (v) =>
    `.s-option-device :has(> input[data-displayname="${v}"i]) .s-rdo-price,
     .s-option-device :has(> input[data-englishname="${v}"i]) .s-rdo-price`,
 
  storage: (v) =>
    `//div[contains(@class, 's-option-storage')]//input[contains(@data-displayname, '${v}')]/parent::div//span[@class='s-rdo-price-wrap']|
     //div[contains(@class, 's-option-sim s-option-os')]//input[contains(@data-displayname, '${v}')]/parent::div//span[@class='s-label-inner']|
     //div[contains(@class, 's-option-storage')]//input[contains(@data-englishname, '${v}')]/parent::div//span[@class='s-rdo-price-wrap']`,

  watchDevice: (v) =>
    `.wearable-option.option-device :has(> input[data-modeldisplay="${v}"i]) .select-label__text-sub,
     .wearable-option.option-device :has(> input[an-la="device:${v}"i]) .select-label__text-sub`,

  bookStoragePrice: (v) =>
    `.s-option-storage input[data-displayname*="${v}"]:has(~ .s-rdo-price-wrap) .s-rdo-price-wrap,
     .s-option-storage :has(> input[data-displayname*="${v}"i]) .s-rdo-price-wrap`,

  bookMemoryPrice: (v) =>
  `.s-option-storage :has(>[data-displayname="${v}"i][name*="memories-rdo "]) .s-rdo-price-wrap`

  
  
};

export class BC {
  private page: Page;
  private utils: Utils;
  private protectionPlanPage: ProtectionPlanPage;
  private tradeInData: TradeInDeviceGroup | undefined;
  private config: ProjectConfig | undefined;
  private addonPage: AddonPage;
  private cart: Cart;
  private simPage: SIMPage; 
  private installmentPlanPage: InstallmentPlanPage;
  public btnAddToCart: Locator;
  private areaTradeIn: Locator;
  private areaProtectionPlan: Locator;
  private areaLoyaltyProgram: Locator;
  private optionTradeInNo: Locator;
  private optionTradeInYes: Locator;
  private optionProtectionPlanNone: Locator;
  private optionLoyaltyProgramNo: Locator;
  private summarySKU: Locator;
  private areaDevice: Locator;
  private tradeInModal: Locator;
  private btnRemoveAdeedTradeIn: Locator;
  private optionLoyaltyProgramYes: Locator;
  private optionPurchaseSIM: Locator;
  private summaryTotalPrice: Locator;
  private pricebarTotalText: Locator;
  private btnPricebarCalculator: Locator;
  private pricebarCalculatorText: Locator;
  private pricebarCalculatorTotalText: Locator;
  private optionInstallmentPlan: Locator;
  private btnUpgradeApply: Locator;
  

  constructor(page: Page, tradeInData?: TradeInDeviceGroup, config?: ProjectConfig) {
    this.page = page;
    this.utils = new Utils(page);
    this.protectionPlanPage = new ProtectionPlanPage(page);
    this.tradeInData = tradeInData;
    this.config = config;
    this.addonPage = new AddonPage(page);
    this.cart = new Cart(page);
    this.simPage = new SIMPage(page);
    this.installmentPlanPage = new InstallmentPlanPage(page);
    this.areaTradeIn = this.page.locator('.hubble-product__options.s-option-trade, .wearable-option.trade-in');
    this.areaProtectionPlan = this.page.locator('.hubble-product__options#protection-plan, div.wearable-option.option-care');
    this.areaLoyaltyProgram = this.page.locator('.hubble-product__options.s-option-loyalty-program');
    this.optionTradeInNo = this.page.locator('.js-no-tradein, .wearable-option__select-item button[an-la="trade-in:no"]');
    this.optionTradeInYes = this.page.locator('.s-option-trade a[an-la="trade-in:yes"i]:not(.is-disabled), .js-tradein-popup a[an-la="trade-in:yes"i]:not(.is-disabled), .wearable-option.trade-in button[an-la="trade-in:yes"i]:not(.is-disabled)');
    this.optionProtectionPlanNone = this.page.locator('.hubble-product__options-list.care_option_list.is-delete, .hubble-product__options.s-option-care #carenone, .wearable-option__select-item button[an-la="protection-plan:none"]');
    this.optionLoyaltyProgramNo = this.page.locator('.hubble-product__options.s-option-loyalty-program #loyalty-no-btn');
    this.optionLoyaltyProgramYes = this.page.locator('.hubble-product__options.s-option-loyalty-program #loyalty-yes-btn');
    this.btnAddToCart = page.locator(`
      .price-bar-cart-btn[an-la="sticky bar:pre order"],
      [an-la="top sticky bar:add to cart"],
      .wearable-bc-calculator [an-la="sticky bar:continue"]
    `);
    this.summarySKU = page.locator('.hubble-product__summary-product .s-option-summary, .wearable-bc-price__description');
    this.areaDevice = this.page.locator('.hubble-product__options.s-option-device.resize-observer, .hubble-product__options.s-option-device,.wearable-bc-buying .wearable-option.option-device');
    this.tradeInModal = this.page.locator('.bc-trade-in-popup, .trade-in-popup-v3, .trade-in-modal');
    this.btnRemoveAdeedTradeIn = this.page.locator(`
      a.s-btn-text[an-la="trade-in:delete" i],
      .s-btn-delete.trade-result-delete[an-la="trade-in:delete"],
      .s-btn-text.s-no-ico.is-delete[an-la="trade-in:remove"],
      .remove-trade-in-result
    `)
    this.optionPurchaseSIM = this.page.locator(`.s-option-box:has([an-la="purchase program:tariff"]),
      .bc-tariff-popup .tariff-popup__radio [an-la*="tariff:select"]`);
    this.summaryTotalPrice = this.page.locator('.hubble-product__total-text, .wearable-bc-header .wearable-bc-price__total:not(.type-saved) .wearable-bc-price__total--price,.wearable-bc-summary-structure-wrap .wearable-bc-price__total:not(.type-saved) .wearable-bc-price__total--price');
    this.pricebarTotalText = this.page.locator('.hubble-price-bar__price-total-text, .wearable-bc-calculator__price');
    this.btnPricebarCalculator = this.page.locator('button.hubble-price-bar__calculator-btn, .wearable-bc-calculator__toggle');
    this.pricebarCalculatorText = this.page.locator('.hubble-price-bar__calculator-product-price, .wearable-bc-summary .wearable-bc-price__list .wearable-bc-price__list-item--price');
    this.pricebarCalculatorTotalText = this.page.locator('.hubble-price-bar__calculator-total-price, .wearable-bc-summary .wearable-bc-price__total:not(.type-saved) .wearable-bc-price__total--price');
    
   
    this.optionInstallmentPlan = this.page.locator(`:has(> [data-service-type="UPGRADE"i]),
.option-purchase [an-la="purchase option:installment-plan:add"]`);
    this.btnUpgradeApply = this.page.locator(`[an-la="upgrade program:apply"],
[an-la="purchase option:installment-plan:add"]`);
  }

  getPriceLocator(type: PriceType, value: string): Locator {
    const selector = priceSelectors[type](value);
    return this.page.locator(selector);
  }

  private getOptionLocator(type: OptionType, value: string): Locator {
    const selector = optionSelectors[type](value);
    return this.page.locator(selector);
  }

  private getWatchOptionLocator(type: WatchOptionType, value: string): Locator {
    const selector = watchOptionSelectors[type](value);
    return this.page.locator(selector);
  }

  private getBookOptionLocator(type: BookOptionType, value: string): Locator {
    const selector = bookOptionSelectors[type](value);
    return this.page.locator(selector);
  }

  async selectDeviceOptions(device: string, color: string, storage: string, connectivity?: string) {
    console.log('Starting to select all device options...');
    
    try {
      await this.selectDevice(device);
      await this.selectStorage(storage);
      await this.selectColor(color);
      
      // Select connectivity only for tablets
      if (this.isTablet(device)) {
        if (connectivity) { 
          await this.selectConnectivity(connectivity);
          console.log('Connectivity option selected for tablet');
        } else {
          console.log('Warning: Tablet detected but no connectivity provided');
        }
      }
      
      console.log('All device options selected successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error selecting all options:', errorMessage);
      throw error;
    }
  }

  async selectWatchOption(device: string, caseColor: string, caseSize: string, connectivity: string) {
    console.log('Starting to select all watch options...');
    
    try {
      await this.selectWatchDevice(device);      
      await this.selectWatchCaseColor(caseColor);    
      await this.selectWatchCaseSize(caseSize);  
      await this.selectWatchConnectivity(connectivity);

      console.log('All watch options selected successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error selecting watch options:', errorMessage);
      throw error;
    }
  }

  async selectBookOptions(options: {
    device: string;
    color: string;
    bookStorage: string;  
    connectivity: string;
    os: string;
    bookMemory: string;
    screen: string;
    processor: string;
    graphics: string;
  }) {
    try {
      // 1. Select device
      await this.selectDevice(options.device);
      
      // 2. Select OS
      await this.selectBookOption('bookOS', options.os);
      
      // 3. Select color
      await this.selectColor(options.color);
      
      // 4. Select storage
      await this.selectStorage(options.bookStorage);
      
      // 5. Select connectivity
      await this.selectBookOption('bookConnectivity', options.connectivity);
      
      // 6. Select screen size
      await this.selectBookOption('bookScreen', options.screen);
      
      // 7. Select processor
      await this.selectBookOption('bookProcessor', options.processor);
      
      // 8. Select memory
      await this.selectBookOption('bookMemory', options.bookMemory);
      
      // 9. Select graphics
      await this.selectBookOption('bookGraphics', options.graphics);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error selecting book options:', errorMessage);
      throw error;
    }
  }



  async selectDevice(device: string) {
    try {
      console.log(`Attempting to select device: "${device}"`);
      const deviceOption = this.getOptionLocator('device', device);
      await this.utils.scrollClick(deviceOption);
      console.log(`${device} device option selected successfully`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to select device "${device}": ${errorMessage}`);
      throw new Error(`Device selection failed: ${device} - ${errorMessage}`);
    }
  }

  async selectColor(color: string) {
    try {
      console.log(`Attempting to select color: "${color}"`);
      const colorOption = this.getOptionLocator('color', color);
      await this.utils.scrollClick(colorOption);
      console.log(`${color} color option selected`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to select color "${color}": ${errorMessage}`);
      throw new Error(`Color selection failed: ${color} - ${errorMessage}`);
    }
  }

  async selectStorage(storage: string) {
    try {
      console.log(`Attempting to select storage: "${storage}"`);
      const storageOption = this.getOptionLocator('storage', storage);
      await this.utils.scrollClick(storageOption);
      console.log(`${storage} storage option selected`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to select storage "${storage}": ${errorMessage}`);
      throw new Error(`Storage selection failed: ${storage} - ${errorMessage}`);
    }
  }


  async selectConnectivity(connectivity: string) {
    try {
      console.log(`Attempting to select connectivity: "${connectivity}"`);
      const connectivityOption = this.getOptionLocator('connectivity', connectivity);
      await this.utils.scrollClick(connectivityOption);
      console.log(`${connectivity} connectivity option selected`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to select connectivity "${connectivity}": ${errorMessage}`);
      throw new Error(`Connectivity selection failed: ${connectivity} - ${errorMessage}`);
    }
  }




  async selectWatchDevice(label: string) {
    try {
      console.log(`Attempting to select watch device: "${label}"`);
      const watchDeviceOption = this.getWatchOptionLocator('watchDevice', label);
      await this.utils.scrollClick(watchDeviceOption);
      console.log(`${label} watch device option selected successfully`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to select watch device "${label}": ${errorMessage}`);
      throw new Error(`Watch device selection failed: ${label} - ${errorMessage}`);
    }
  }

  async selectWatchCaseColor(label: string) {
    try {
      console.log(`Attempting to select watch case color: "${label}"`);
      const watchCaseColorOption = this.getWatchOptionLocator('watchCaseColor', label);
      await this.utils.scrollClick(watchCaseColorOption);
      console.log(`${label} watch case color option selected successfully`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to select watch case color "${label}": ${errorMessage}`);
      throw new Error(`Watch case color selection failed: ${label} - ${errorMessage}`);
    }
  }

  async selectWatchCaseSize(label: string) {
    try {
      console.log(`Attempting to select watch case size: "${label}"`);
      const watchCaseSizeOption = this.getWatchOptionLocator('watchCaseSize', label);
      await this.utils.scrollClick(watchCaseSizeOption);
      console.log(`${label} watch case size option selected successfully`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to select watch case size "${label}": ${errorMessage}`);
      throw new Error(`Watch case size selection failed: ${label} - ${errorMessage}`);
    }
  }


  async selectWatchConnectivity(label: string) {
    try {
      console.log(`Attempting to select watch connectivity: "${label}"`);
      const watchConnectivityOption = this.getWatchOptionLocator('watchConnectivity', label);
      await this.utils.scrollClick(watchConnectivityOption);
      console.log(`${label} watch connectivity option selected successfully`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to select watch connectivity "${label}": ${errorMessage}`);
      throw new Error(`Watch connectivity selection failed: ${label} - ${errorMessage}`);
    }
  }


  async selectBookOption(type: BookOptionType, value: string) {
    try {
      console.log(`Attempting to select book option: "${value}"`);
      const bookOptionOption = this.getBookOptionLocator(type, value);
      await this.utils.scrollClick(bookOptionOption);
      console.log(`${value} book option selected successfully`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to select book option "${value}": ${errorMessage}`);
      throw new Error(`Book option selection failed: ${value} - ${errorMessage}`);
    }
  }



   async verifyPrice(type: PriceType, value: string): Promise<string[]> {
    const priceLocator = this.getPriceLocator(type, value);
    return await this.verifyPriceValues(priceLocator);
  }
  
  private static readonly PRICE_EXCLUDED_SITES = ['dk', 'fi', 'se', 'no'] as const;

  async verifyPriceValues(target: Locator): Promise<string[]> {
    try {
      const site = this.config?.siteCode;
      
      // Early return: excluded sites check
      if (site && BC.PRICE_EXCLUDED_SITES.includes(site.toLowerCase() as typeof BC.PRICE_EXCLUDED_SITES[number])) {
        return [];
      }

      // Element preparation and text extraction
      const element = target.first();
      await expect.soft(element, 'Price element not visible').toBeVisible({ timeout: 5000 });
      
      const rawText = (await element.innerText()).trim();
      
      // Text cleanup: noise removal
      const cleanedText = rawText
        .replace(/(from|or|total|free shipping|\/mo\.|over \d+ months|\*|\r|\n)/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Token extraction
      const tokens = this.extractPriceTokens(cleanedText, site);
      
      // Validation and logging
      await expect.soft(tokens.length, `No price tokens found in: '${rawText}'`).toBeGreaterThan(0);
      console.log(`[${tokens.length}] ${rawText} → [${tokens.join(', ')}]`);
      
      return tokens;
      
    } catch (error) {
      console.error('Price verification failed:', error);
      return [];
    }
  }

  private extractPriceTokens(cleanedText: string, site?: string): string[] {
    const pattern = this.selectPricePattern(site || '');
    
    // Modern API: using matchAll() to remove while loop
    return Array.from(cleanedText.matchAll(pattern))
      .map(match => match[0].trim())
      .filter(token => token.length > 0 && this.isValidPriceToken(token));
  }

  private isValidPriceToken(token: string): boolean {
    // Consider as price token if it contains at least one number
    return /\d/.test(token);
  }

  private selectPricePattern(site: string): RegExp {
    switch (site.toLowerCase()) {
      case 'uk':
        // £ amounts, letters (\p{L}), other symbols
        return /£?\d{1,3}(?:,\d{3})*(?:\.\d+)?|£?\d+\.\d*|\p{L}+|[^\s\p{L}\d]+/gu;

      // Fill in actual patterns in the cases below when needed
      case 'us':
        return /\S+/gu;

      case 'au':
        return /\S+/gu;

      case 'kr':
        return /\S+/gu;

      default:
        // Default number/letter/symbol tokens
        return /\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+\.\d*|\p{L}+|[^\s\p{L}\d]+/gu;
    }
  }

    async verifySummaryAndCalculatorPrice(): Promise<void> {
      try {
        console.log('Starting summary and calculator validation');
        
        // Step 1: Initial price validation
        await this.verifyPriceValues(this.summaryTotalPrice);
        await this.verifyPriceValues(this.pricebarTotalText);
        
        // Step 2: Click calculator button
        await this.utils.scrollClick(this.btnPricebarCalculator);
        
        await this.page.waitForTimeout(1000);
        
        // Step 3: Wait for calculator loading
        await expect.soft(this.pricebarCalculatorText.first()).toBeVisible({ timeout: 10000 });
        
        // Step 4: Calculator price validation
        await this.verifyPriceValues(this.pricebarCalculatorText.first());
        await this.verifyPriceValues(this.pricebarCalculatorTotalText);
        
        console.log('Summary and calculator validation completed');
        
      } catch (error) {
        console.error('Summary and calculator validation failed:', error);
        throw error;
      }
    }
 
  async isBCVisible(): Promise<boolean> {
    try {      
      await expect(this.areaDevice).toBeVisible({ timeout: TIMEOUTS.STANDARD});    
      console.log('BC page is visible');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('BC page is not visible:', errorMessage);      
      return false; // Return false instead of error
    }
  }

  async isTradeInAvailable(): Promise<boolean> {
    try {
      return await this.areaTradeIn.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  async isProtectionPlanAvailable(): Promise<boolean> {
    try {
      return await this.areaProtectionPlan.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  async isSIMAvailable(): Promise<boolean> {
    try {
      return await this.simPage.btnAddSIM.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  async addSIM() {
    await this.clickSIMBtn();
    await this.page.waitForTimeout(DELAYS.STANDARD);
    await this.simPage.addSIMPopupInBC();
    console.log('SIM successfully added to cart');
  }
  
  async clickSIMBtn() {
    if (await this.simPage.btnAddSIM.isVisible({ timeout: 3000 })) {
      await this.simPage.btnAddSIM.click();
      console.log('SIM button clicked');
    }else{
      if (await this.optionPurchaseSIM.isVisible({ timeout: 2000 })) {
        await this.optionPurchaseSIM.click();
        console.log('SIM button clicked');
      } else {
        console.log('SIM purchase option not visible, skipping');
      }
    }
  
  }

  async getSelectedSKU(): Promise<string> {
    try {
      console.log('Getting selected SKU (optimized)...');
      
      await this.page.waitForTimeout(DELAYS.SHORT);
      
      // Retry with page reload if summarySKU is not visible
      try {
        await expect(async () => {
          if (await this.summarySKU.isVisible({ timeout: 1000 })) return; 
          
          console.log('summarySKU not visible, reloading page');
          await this.page.reload();
          await this.page.waitForTimeout(DELAYS.SHORT);
          expect(await this.summarySKU.isVisible({ timeout: TIMEOUTS.LONG })).toBe(true);
        }).toPass({ timeout: 15000, intervals: [2000, 5000, 10000] });
      } catch (error) {
        throw error; 
      }

      await expect(this.summarySKU).toHaveText(/.+/, { timeout: TIMEOUTS.LONG });
      
      const skuText = await this.summarySKU.textContent();
      const trimmedSku = skuText!.trim();
      
      console.log(`Selected SKU (optimized): ${trimmedSku}`);
      return trimmedSku;
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to get selected SKU (optimized): ${errorMessage}`);
      throw new Error(`Unable to get selected SKU (optimized): ${errorMessage}`);
    }
  }

  async highlightSkuAndCapture(): Promise<Buffer> {
    await this.summarySKU.evaluate(el => {
      (el as HTMLElement).style.border = '3px solid red';
      (el as HTMLElement).style.backgroundColor = 'yellow';
      (el as HTMLElement).style.boxShadow = '0 0 10px red';
    });
    const screenshot = await this.page.screenshot();
    await this.summarySKU.evaluate(el => {
      (el as HTMLElement).style.border = '';
      (el as HTMLElement).style.backgroundColor = '';
      (el as HTMLElement).style.boxShadow = '';
    });
    return screenshot;
  }

  /**
   * Verify SKU by comparing expected and actual values
   * @param expected - Expected SKU text from config
   * @param actual - Actual SKU text from page
   * @param timeout - Timeout in milliseconds (default: 5000)
   */
  async expectSKUSelected(expected: string, actual: string, timeout: number = TIMEOUTS.STANDARD): Promise<void> {
    await expect.soft(this.summarySKU).toBeVisible({ timeout });
    
    // null/undefined check
    if (!expected || typeof expected !== 'string') {
      throw new Error(`Invalid expected SKU: ${expected}. Expected must be a non-empty string.`);
    }
    
    if (!actual || typeof actual !== 'string') {
      throw new Error(`Invalid actual SKU: ${actual}. Actual must be a non-empty string.`);
    }
    
    // Direct comparison
    if (actual.trim() !== expected.trim()) {
      throw new Error(`SKU mismatch!\n  Expected(bc): "${expected}"\n  Actual(input): "${actual}"\n  Location: ${this.summarySKU}`);
    }
    
    console.log(`SKU assertion passed. Expected: ${expected}, Actual: ${actual}`);
  }

  async addToCart() {
    const buttons = await this.btnAddToCart.all();
    console.log(`Found ${buttons.length} add to cart buttons`);

    const buttonPromises = buttons.map(async (button) => {
      try {
        await button.waitFor({ state: 'visible', timeout: 15000 });
        if (await button.isEnabled()) {
          await this.utils.scrollClick(button);
          console.log('Successfully clicked add to cart button');
          return { success: true, button };
        }
        return { success: false, button };
      } catch (error) {
        return { success: false, button };
      }
    });

    const results = await Promise.allSettled(buttonPromises);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        return;
      }
    }

    throw new Error('No suitable add to cart button found');
  }

async continueToCart(): Promise<void> {
  try {
    console.log('Starting continue to cart process...');
    
    // Select "No" for services if needed
    await this.page.waitForTimeout(1000);
    await this.tradeInNoIfNeeded();
    await this.protectionPlanNoneIfNeeded();
    await this.loyaltyProgramNoIfNeeded();  
   
    
    // Add item to cart
    await this.addToCart();
    console.log('Item added to cart');

    // Skip intermediate pages (addon, freegift, etc.)
    await this.skipBridge();

    await this.cart.expectCartPageIsOpen();
        
    console.log('Successfully continued to cart');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Failed to continue to cart:', errorMessage);
    throw new Error(`Continue to cart failed: ${errorMessage}`);
  }
}

async skipBridge(): Promise<void> {
  try {
    console.log('Skipping bridge pages...');
    
    // Handle addon page if present
    await this.addonPage.handleAddonPage();
    
    console.log('Bridge pages skipped');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`Bridge skip completed with warning: ${errorMessage}`);
  }
}


  async tradeInNoIfNeeded(): Promise<void> {
    if (await this.areaTradeIn.isVisible({ timeout: 15000 })) {
      console.log('Trade-in area found, checking status...');
      try {
        // Check if remove trade-in button is visible (indicates trade-in is already added)
        let isAlreadyAdded = false;
        // if au this.btnRemoveAdeedTradeIn is .s-btn-delete.trade-result-delete[an-la="trade-in:delete"]
        if (this.config?.siteCode?.toLowerCase() === 'au') {
          isAlreadyAdded = await this.utils.isElementVisible('.s-btn-delete.trade-result-delete[an-la="trade-in:delete"], .remove-trade-in-result', 'Remove trade-in button');
        }else{
          isAlreadyAdded = await this.btnRemoveAdeedTradeIn.isVisible({ timeout: 3000 });
        }

        if (!isAlreadyAdded) {
          console.log('Trade-in not added, selecting "No"');
          await this.selectNoTradeIn();
        } else {
          console.log('Trade-in already added, skipping');
        }
      } catch {
        // If error occurs, assume not added and proceed with "No" selection
        console.log('Error checking trade-in status, selecting "No"');
        await this.selectNoTradeIn();
      }
    } else {
      console.log('No trade-in area found, skipping');
    }
  }

  async loyaltyProgramNoIfNeeded(): Promise<void> {
    if (await this.areaLoyaltyProgram.isVisible({ timeout: 15000 })) {
      try {
        // Check if both Yes and No buttons are disabled
        const isYesDisabled = await this.optionLoyaltyProgramYes.isDisabled();
        const isNoDisabled = await this.optionLoyaltyProgramNo.isDisabled();
        
        // If both buttons are disabled, skip selection
        if (isYesDisabled && isNoDisabled) {
          console.log('Loyalty program options are disabled, skipping selection');
          return;
        }
        
        // Check if "Yes" is selected
        const isYesSelected = await this.optionLoyaltyProgramYes.evaluate(el => {
          return ['selected', 'active', 'is-selected'].some(className => 
            el.classList.contains(className)
          );
        });
        
        // If "Yes" is not selected, select "No"
        if (!isYesSelected) {
          await this.selectNoLoyaltyProgram();
        }
      } catch {
        // If error occurs, assume not selected and proceed with "No" selection
        await this.selectNoLoyaltyProgram();
      }
    }
  }

  async protectionPlanNoneIfNeeded(): Promise<void> {
    if (await this.areaProtectionPlan.isVisible({ timeout: 15000 })) {
      console.log('Protection plan area found, checking status...');
      try {
        // Check if any protection plan option (other than None) is selected
        const hasSelectedOption = await this.areaProtectionPlan.locator(':not(.is-delete)').evaluateAll(elements => {
          return elements.some(el => {
            return ['selected', 'checked', 'is-selected', 'is-checked'].some(className =>
              el.classList.contains(className)
            );
          });
        });
        
        // If no protection plan option is selected, select "None"
        if (!hasSelectedOption) {
          console.log('No protection plan option selected, selecting "None"');
          await this.selectNoProtectionPlan();
        } else {
          console.log('Protection plan option already selected, skipping');
        }
      } catch {
        // If error occurs, assume not selected and proceed with "None" selection
        console.log('Error checking protection plan status, selecting "None"');
        await this.selectNoProtectionPlan();
      }
    } else {
      console.log('No protection plan area found, skipping');
    }
  }

  async selectNoProtectionPlan() {
    // Check if visible first
    try {
      await expect(this.areaProtectionPlan).toBeVisible({ timeout: TIMEOUTS.LONG });
    } catch (error) {
      // Skip if not visible
      console.log('Protection plan section not visible, skipping');
      return;
    }

    try {
      await this.utils.scrollClick(this.optionProtectionPlanNone);
      console.log('No protection plan option selected');
    } catch (error) {
      throw new Error('Failed to select no protection plan option');
    }
  }

  async addProtectionPlan(isWatch?: boolean) {
    await expect(this.areaProtectionPlan).toBeVisible({ timeout: TIMEOUTS.LONG });
    
    await this.areaProtectionPlan.scrollIntoViewIfNeeded();
    await this.protectionPlanPage.addProtectionPlanOptionsInBC(isWatch ?? false);
    await this.protectionPlanPage.addProtectionPlanPopupInBC();
  }

  
   async selectNoLoyaltyProgram() {
    // Check if visible first
    try {
      await expect(this.areaLoyaltyProgram).toBeVisible({ timeout: TIMEOUTS.LONG });
    } catch (error) {
      // Skip if not visible
      console.log('Loyalty program section not visible, skipping');
      return;
    }

    try {
      await this.utils.scrollClick(this.optionLoyaltyProgramNo);
      console.log('No loyalty program option selected');
    } catch (error) {
      throw new Error('Failed to select no loyalty program option');
    }
  }


  /**
   * Add trade-in option based on device name
   * @param device - Device name (e.g., "Galaxy S24", "Galaxy Watch")
   */
  async addTradeIn(device: string): Promise<void> {
    try {
      console.log(`addTradeIn started - device: ${device}`);
      
      await this.selectTradeInYes();
      await this.waitForTradeInOpen();
      
      const tradeInData = this.getTradeInDataForDevice(device);
      
      const tradeIn = new TradeInBC(this.page);
      await tradeIn.process(tradeInData);
      
      await this.waitForTradeInClose();
      console.log('Added trade-in successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Unable to add trade-in on BC page: ${errorMessage}`);
      throw new Error(`Unable to add trade-in on BC page. Root cause: ${errorMessage}`);
    }
  }

  /**
   * Check if protection plan "Yes" option is already selected
   * @returns {Promise<boolean>} True if any protection plan option (other than None) is selected
   */
  private async isProtectionPlanYesSelected(): Promise<boolean> {
    try {
      if (!(await this.areaProtectionPlan.isVisible({ timeout: 3000 }))) return false;

      // Check if any protection plan option (other than None) is selected
      const hasSelectedOption = await this.areaProtectionPlan.locator(':not(.is-delete)').evaluateAll(elements => {
        return elements.some(el => {
          return ['selected', 'checked', 'is-selected', 'is-checked'].some(className =>
            el.classList.contains(className)
          );
        });
      });
      
      return hasSelectedOption;
    } catch {
      return false;
    }
  }

    /**
   * Select no trade-in option
   */
  async selectNoTradeIn() {
    // Check if visible first
    try {
      await expect(this.areaTradeIn).toBeVisible({ timeout: TIMEOUTS.LONG });
    } catch (error) {
      // Skip if not visible
      console.log('Trade-in section not visible, skipping');
      return;
    }
    
    // If we reach here, TradeIn is visible
    // Throw custom error if No button click fails
    try {
      await this.utils.scrollClick(this.optionTradeInNo);
      console.log('No Trade-in option selected');
    } catch (error) {
      throw new Error('Failed to select no trade-in option');
    }
  }

  /**
   * Select yes trade-in option
   */
  async selectYesTradeIn() {
    // Fail if TradeIn area is not visible
    try {
      await expect(this.areaTradeIn).toBeVisible({ timeout: TIMEOUTS.LONG });
    } catch (error) {
      throw new Error('Trade-in section is not visible - cannot select yes option');
    }
    
    // If we reach here, TradeIn is visible
    // Throw custom error if Yes button click fails
    try {
      await this.utils.scrollClick(this.optionTradeInYes);
      console.log('Yes Trade-in option selected');
    } catch (error) {
      throw new Error('Failed to select yes trade-in option');
    }
  }

  private getTradeInDataForDevice(device: string): TradeInDevice {
    let data: TradeInDevice | undefined;
    let deviceType: string;

    if (this.isWatch(device)) {
      data = this.tradeInData?.watch;
      deviceType = 'watch';
    } else if (this.isTablet(device)) {
      data = this.tradeInData?.tablet;
      deviceType = 'tablet';
    } else {
      data = this.tradeInData?.phone;
      deviceType = 'phone';
    }

    if (!data) {
      throw new Error(`No ${deviceType} data available`);
    }

    return data;
  }

  private async selectTradeInYes(): Promise<void> {
    await this.utils.scrollClick(this.optionTradeInYes);
  }

  private isWatch(device: string): boolean {
    return device.toLowerCase().includes('watch');
  }

  private isTablet(device: string): boolean {
    return device.toLowerCase().includes('tab') || device.toLowerCase().includes('tablet');
  }

  private async waitForTradeInOpen(): Promise<void> {
    await expect(this.tradeInModal).toBeVisible({ timeout: TIMEOUTS.LONG });
  }

  private async waitForTradeInClose(): Promise<void> {
    await expect(this.tradeInModal).not.toBeVisible({ timeout: TIMEOUTS.LONG });
  }
  async verifyTradeInAdded(): Promise<void> {
    try {
      console.log('Verifying remove trade-in button visibility...');      
      
      if (this.config?.siteCode?.toLowerCase() === 'au') {
        await this.utils.isElementVisible('.s-btn-delete.trade-result-delete[an-la="trade-in:delete"], .remove-trade-in-result', 'Remove trade-in button');
        console.log('AU: Remove trade-in button is visible - PASS');
      } else {
        await expect(this.btnRemoveAdeedTradeIn).toBeVisible({timeout: TIMEOUTS.LONG});      
        console.log('Remove trade-in button is visible - PASS');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const fullErrorMessage = `Remove trade-in button verification failed: ${errorMessage}`;
      console.error('Remove trade-in button is not visible - FAILED');

      throw new Error(fullErrorMessage);
    }
  }

  async addInstallmentPlan() {
    await this.utils.scrollClick(this.optionInstallmentPlan);
    await this.clickUpgradeApply();
    await this.installmentPlanPage.waitForOpenedInstallmentPlanPopup();
    await this.installmentPlanPage.clickConfirmInstallmentPlanPopup();
  }

  async isInstallmentPlanAvailable(): Promise<boolean> {
    try {
      return await this.optionInstallmentPlan.isVisible({ timeout: TIMEOUTS.LONG });
    } catch {
      return false;
    }
  }

  async clickUpgradeApply() {
    try {
      const timeout = 5000;
      const startTime = Date.now();
      
      while (Date.now() - startTime < timeout) {
        try {
          const elements = await this.btnUpgradeApply.all();
          
          for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];
            
            if (await element.isVisible()) {
              await element.scrollIntoViewIfNeeded();
              await element.click();
              return;
            }
          }
        } catch (error) {
          await this.page.waitForTimeout(100);
        }
      }
      
      throw new Error("Unable to click Upgrade Apply button - timeout after 5 seconds");
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Unable to click Upgrade Apply button: ${errorMessage}`);
    }
  }

  async retryNavigation(gnb: any, category: string, product: string): Promise<void> {
    for (let i = 1; i <= 3; i++) {
      await gnb.hoverGnbCategory(category);
      await gnb.clickGnbCatalog(category, product);
      
      if (await this.isBCVisible()) return;
      
      if (i === 3) {
        throw new Error(`BC page not visible after 3 navigation retries for ${category}/${product}`);
      }
      
      console.log(`Navigation failed, retry ${i}/3`);
      await this.page.waitForTimeout(2000);
    }
  }

}