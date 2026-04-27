import { Page, Locator, expect } from '@playwright/test';
import { DELAYS, TIMEOUTS, Utils } from './Utils';
import { ProtectionPlanPage } from './ProtectionPlan';
import { TradeInCart } from './TradeIn/TradeInCart';
import { InstallmentPlanPage } from './InstallmentPlan';
import { SIMPage } from './SIM';
import { TradeUpPopup } from './TradeUpPopup';
import { ProjectConfig, TradeInDevice, TradeInDeviceGroup, TradeUpSiteData } from '../types/config';

export class Cart {
  readonly page: Page;
  readonly installmentPlanPage: InstallmentPlanPage;
  private tradeInData: TradeInDeviceGroup | undefined;
  readonly protectionPlanPage: ProtectionPlanPage;
  readonly simPage: SIMPage;
  readonly cartArea: Locator;
  readonly cartItemBySKU: Locator;
  readonly deleteIcon: Locator;
  readonly removeCartitem: Locator;
  readonly removeConfirmPopup: Locator;
  readonly checkoutButton: Locator;  // Checkout button locator
  readonly RecomendItem: Locator;    // Recommended item add button locator
  readonly paymentList: Locator;    // Payment list locator
  readonly orderSummary_area: Locator;    // Order summary locator
  readonly paypalExpress: Locator;    // PayPal Express locator
  readonly btnAddTradeUp: Locator;    // Trade-up add button locator
  readonly tradeUpPopup?: TradeUpPopup;    // Trade-up popup locator
  readonly installmentPlanAddBtn: Locator;    // Installment plan add button locator


  constructor(page: Page, tradeInData?: TradeInDeviceGroup, config?: ProjectConfig) {
    this.page = page;
    this.tradeInData = tradeInData;
    this.protectionPlanPage = new ProtectionPlanPage(page);
    this.installmentPlanPage = new InstallmentPlanPage(page);
    this.simPage = new SIMPage(page);

    // Skip TradeUpPopup if config is missing
    if (config?.siteCode) {
      this.tradeUpPopup = new TradeUpPopup(page, config.siteCode, 'Cart');
    }
    // Cart page layout locator
    this.cartArea = page.locator('cz-page-layout.CartPageTemplateV2.ng-star-inserted, cx-page-layout[class*="CartPageTemplateV2"]');
    // Cart SKU verification locator
    this.cartItemBySKU = page.locator('.cart-item.ng-star-inserted');
    // Delete icon (protection plan item delete button)
    this.deleteIcon = page.locator('[class*="delete"], [class*="remove"], [aria-label*="delete"], [aria-label*="remove"], button[class*="btn-delete"], .delete-btn, .remove-btn');
    // Delete button (cart product delete button)
    this.removeCartitem = page.locator('[data-an-tr="cart-product-remove"], [data-an-la="remove item"]');
    // Delete confirmation popup layout
    this.removeConfirmPopup = page.locator('app-cart-item-remove-modal');
    // Checkout button locator (using data-an-la="proceed to checkout")
    this.checkoutButton = page.locator('[data-an-la="proceed to checkout"].sticky-cta-enabled');
    // Recommended item add button locator
    this.RecomendItem = page.locator('button[data-an-tr="add-to-cart"]');
    // Payment list locator
    this.paymentList = page.locator('div[id="cartPaymentOptions"]');
    // Order summary locator
    this.orderSummary_area = page.locator(`.order-summary-wrapper.fixed.ng-star-inserted,div.cart-summary,div.order-summary,div.sticky-cart-summary`);
    // PayPal Express locator
    this.paypalExpress = page.locator('div.adyen-checkout__paypal__button.adyen-checkout__paypal__button--paypal');
    // Trade-up add button locator
    this.btnAddTradeUp = page.locator(`button[data-an-la="add service:trade-up"],
      #as-tradeup [data-an-la="add service:trade-up"],
      button[data-omni-type="tradeup"],
      button[data-an-la="add service:tradeinTV"],
      button[data-an-la="add service:tradeup"],
      button[data-an-la="add service:tradeinTv"]`
    );
    // Installment plan add button locator
    this.installmentPlanAddBtn = page.locator(`[data-an-la="add service:installment-plan"]`);

  }


  async addTradeIn(line: number, device: string): Promise<void> {
    try {

      const tradeInAddBtn = `.cart-product-list .cart-row:nth-child(${line}) [data-an-la="add service:trade-in"],
.cart-item-list :nth-child(${line}) [data-an-la="add service:trade-in"],
.cart-item-list.ng-star-inserted:nth-child(${line} of .cart-item-list) .service-item[data-modelcode="TRADE-IN"]:not(.service-item__trade-up) button[data-an-la="add service:trade-in"]`;

      const tradeInButton = this.page.locator(tradeInAddBtn);
      await tradeInButton.waitFor({ timeout: TIMEOUTS.STANDARD });
      await expect(tradeInButton).toBeVisible();
      await expect(tradeInButton).toBeEnabled();

      // Check if button exists before clicking
      const buttonCount = await tradeInButton.count();

      if (buttonCount === 0) {
        throw new Error(`Trade-in button not found at line ${line}`);
      }

      await tradeInButton.click();

      const tradeInData = this.getTradeInDataForDevice(device);
      const tradeIn = new TradeInCart(this.page);
      await tradeIn.process(tradeInData);

    } catch (error: any) {
      throw new Error(`Unable to add trade-in on Cart page. Root cause: ${error.message}`);
    }
  }

  async addSCPlus(line: number, type: string) {
    try {
      // Click SC+ add button for the corresponding SKU object
      const scpAddBtn = `.cart-product-list .cart-row:nth-child(${line}) [data-an-la="add service:protection-plan"],
    .cart-item-list [data-an-la="add service:protection-plan"],
    .cart-item-list.ng-star-inserted:nth-child(${line} of .cart-item-list) [data-an-la="add service:protection-plan"]`;

      await this.page.locator(scpAddBtn).click();
      await this.protectionPlanPage.addProtectionPlanOptionsInCart(type);

    } catch (error: any) {
      throw new Error(`Failed to add SC Plus: ${error.message}`);
    }
  }


  async addInstallmentPlan() {
    try {
      await this.installmentPlanAddBtn.scrollIntoViewIfNeeded();
      await this.installmentPlanAddBtn.click();
      await this.installmentPlanPage.addInstallmentPlanInCart();

    } catch (error: any) {
      throw new Error(`Failed to add installment plan: ${error.message}`);
    }
  }

  async verifyInstallmentPlanInCart() {
    try {
      await this.installmentPlanPage.verifyInstallmentPlanRemoveBtn();
      return true;

    } catch (error: any) {
      throw new Error(`Installment plan verification failed: ${error.message}`);
    }
  }

  /**
   * Get trade-in data for the specified device (same logic as BC)
   * @param device - Device name
   * @returns Trade-in data object
   */
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

  private isWatch(device: string): boolean {
    return device.toLowerCase().includes('watch');
  }

  private isTablet(device: string): boolean {
    return device.toLowerCase().includes('tab') || device.toLowerCase().includes('tablet');
  }

  private btnRemoveAddedTradeIn = (line: number) => {
    const selectors = [
      `.cart-product-list .cart-row:nth-child(${line}) [data-an-la="add service:trade-in"],
.cart-product-list .cart-row:nth-child(${line}) a.remove[ng-click*="TRADEIN"],
.cart-item-list.ng-star-inserted [data-modelcode="TRADE-IN"]:not(.service-item__trade-up) [data-an-tr="cart-product-remove"],
.cart-product-list > *:nth-child(${line} of li.cart-row) #as-tradein [data-an-tr='cart-product-remove'], /* cz, sk */
.cart-item-list.ng-star-inserted:nth-child(${line} of .cart-item-list) .service-item[data-modelcode="TRADE-IN"]:not(.service-item__trade-up) [data-an-la="remove-item"] /* cn */,
.cart-item-list.ng-star-inserted [data-modelcode="TRADE-IN"]:not(.service-item__trade-up) [data-an-la="remove item"]
`
    ];
    return selectors.join(', ');
  };

  private btnRemoveAddedProtectionPlan = (line: number) => {
    const selectors = [
      `.cart-product-list .cart-row:nth-child(${line}) [data-an-la="add service:protection-plan"],
.cart-product-list .cart-row:nth-child(${line}) a.remove[ng-click*="SMC"],
.cart-item-list.ng-star-inserted .service-item__smc [data-an-tr="cart-product-remove"],
.cart-item-list.ng-star-inserted:nth-child(${line}) .service-item__details--smc ~ .service-item__actions [data-an-tr="cart-product-remove"], /* IT */
.cart-item-list.ng-star-inserted:nth-child(${line} of .cart-item-list) .service-item[data-pvisubtype="watch"] [data-an-la="remove-item"] /* cn */,
.cart-item-list.ng-star-inserted:nth-child(${line}) [data-modelname="SMC-CZ"] [data-an-la="remove item"], /* CZ */
.cart-item-list.ng-star-inserted:nth-child(${line}) [data-modeldisplay="Protection Plan"] [data-an-la="remove item"],
.cart-item-list.ng-star-inserted:nth-child(${line}) [data-modeldisplay*="Protection Plan"] [data-an-la="remove item"],
.cart-item-list.ng-star-inserted:nth-child(${line}) .service-item__smc [data-an-la="remove item"] /* SG */
  `];
    return selectors.join(', ');
  };


  /**
   * Check if Trade-in add button is available for specific line
   * @param line - Line number to check for trade-in availability
   * @returns Promise<boolean> - true if trade-in button is available and enabled
   */
  async isAddTradeInAvailable(line: number): Promise<boolean> {

    const tradeInAddBtn = `.cart-product-list .cart-row:nth-child(${line}) [data-an-la="add service:trade-in"],
.cart-item-list :nth-child(${line}) [data-an-la="add service:trade-in"],
.cart-item-list.ng-star-inserted:nth-child(${line} of .cart-item-list) .service-item[data-modelcode="TRADE-IN"]:not(.service-item__trade-up) button[data-an-la="add service:trade-in"]`;

    const addButton = this.page.locator(tradeInAddBtn);

    try {
      await addButton.scrollIntoViewIfNeeded();
      await addButton.waitFor({ timeout: TIMEOUTS.SHORT });
      return await addButton.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Verify that Trade-in is added to cart for specific line
   * Uses web-first assertions with proper error handling
   * @param line - Line number to check for trade-in
   */
  async verifyTradeInAdded(line: number): Promise<void> {
    const tradeInRemoveButton = this.page.locator(this.btnRemoveAddedTradeIn(line));
    await expect(tradeInRemoveButton).toBeVisible({ timeout: TIMEOUTS.LONG });

  }

  async verifyTradeInAddedCount(line: number, expectedCount: number, errorMessage: string): Promise<void> {
    const tradeInButton = this.page.locator(this.btnRemoveAddedTradeIn(line));
    const tradeInCount = await tradeInButton.count();

    if (tradeInCount !== expectedCount) {
      throw new Error(`${errorMessage}. Expected: ${expectedCount}, Actual: ${tradeInCount}`);
    }
  }



  /**
   * Verify that cart page is opened properly
   * Check if cart page layout element is visible
   */
  async expectCartPageIsOpen() {
    try {
      await expect(this.cartArea).toBeVisible({ timeout: TIMEOUTS.LONG });
      console.log('✅ Cart page loaded successfully');
    } catch (error) {
      throw new Error('Cart page should be visible');
    }
  }

  /**
   * Check if cart item exists by SKU
   * @param sku - SKU value to check
   */
  async verifyCartSKU(sku: string) {
    try {
      // Use cartItemBySKU locator defined above to find cart item by SKU
      const cartItem = this.cartItemBySKU.filter({ has: this.page.locator(`[data-modelcode="${sku}"]`) });
      await expect(cartItem).toBeVisible({ timeout: TIMEOUTS.STANDARD });
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Verify that multiple SKUs are in cart 
   * @param expectedSkus - Array of SKUs to verify
   */
  async verifyAllSkus(expectedSkus: string[]): Promise<void> {
    try {
      // Use Set data structure for O(1) performance optimization
      const expectedSkusSet = new Set(expectedSkus);
      const foundSkus = new Set<string>();

      // Check cart item count
      const cartItems = await this.cartItemBySKU.all();

      // Error if no cart items
      if (cartItems.length === 0) {
        throw new Error('No cart items found on the page');
      }

      // Use all() method for more modern iteration
      for (const cartItem of cartItems) {
        // Get SKU attribute
        const cartItemSKU = await cartItem.getAttribute('data-modelcode');

        if (!cartItemSKU?.trim()) {
          continue;
        }

        const trimmedSKU = cartItemSKU.trim();
        foundSkus.add(trimmedSKU);
      }

      // Check for missing SKUs
      const missingSkus = expectedSkus.filter(sku => !foundSkus.has(sku));
      if (missingSkus.length > 0) {
        const errorMessage = `Missing SKUs in cart: ${missingSkus.join(', ')}`;
        throw new Error(errorMessage);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw error;
    }
  }

  async isAddSCPlusAvailable(line: number): Promise<boolean> {
    const scpAddBtn = `.cart-product-list .cart-row:nth-child(${line}) [data-an-la="add service:protection-plan"],
    .cart-item-list :nth-child(${line}) [data-an-la="add service:protection-plan"],
    .cart-item-list.ng-star-inserted:nth-child(${line} of .cart-item-list) .service-item[data-modelcode="PROTECTION-PLAN"] button[data-an-la="add service:protection-plan"]`;
    const addButton = this.page.locator(scpAddBtn);

    try {
      await addButton.scrollIntoViewIfNeeded();
      await addButton.waitFor({ timeout: TIMEOUTS.SHORT });
      return await addButton.isEnabled();
    } catch {
      return false;
    }
  }


  async addSCPlusTryBothOptions(): Promise<void> {
    try {
      await this.addSCPlus(1, 'standard');
    } catch (StepFailedException) {
      try {
        await this.addSCPlus(1, 'subscription');
      } catch (StepFailedException) {
        throw new Error('Failed to add protection plan in cart');
      }
    }
  }

  /**
   * Verify that protection plan is added to cart
   */
  async verifySCPInCart(line: number) {
    try {
      const scpRemoveButton = this.page.locator(this.btnRemoveAddedProtectionPlan(line));
      await expect(scpRemoveButton).toBeVisible({ timeout: TIMEOUTS.LONG });
    } catch (error: any) {
      throw new Error(`Protection plan verification failed: ${error.message}`);
    }
  }



  async verifySIMInCart() {
    try {
      await this.simPage.verifySIMRemoveBtn();
      return true;
    }
    catch (error: any) {
      throw new Error(`SIM verification failed: ${error.message}`);
    }
  }

  async isAddInstallmentPlanAvailable(): Promise<boolean> {
    try {
      await this.installmentPlanAddBtn.scrollIntoViewIfNeeded();
      await this.installmentPlanAddBtn.waitFor({ timeout: TIMEOUTS.SHORT });
      return await this.installmentPlanAddBtn.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Remove all cart items
   */
  async removeAllCartItems() {
    try {
      let removedCount = 0;
      const MAX_REMOVE_ATTEMPTS = 20;

      while (removedCount < MAX_REMOVE_ATTEMPTS) {
        // Wait for at least one remove button to be visible
        try {
          await expect(this.removeCartitem.first()).toBeVisible({ timeout: TIMEOUTS.SHORT });
        } catch {
          // No more items to remove, break the loop
          break;
        }

        // Click first delete button
        const firstRemoveBtn = this.removeCartitem.first();
        await firstRemoveBtn.click();

        // Handle popup
        await this.handleRemoveConfirmationPopup();

        // Wait for cart items to update after removal
        await this.page.waitForTimeout(DELAYS.SHORT);
        removedCount++;
      }

      if (removedCount >= MAX_REMOVE_ATTEMPTS) {
        console.warn(`Safety limit reached: ${MAX_REMOVE_ATTEMPTS} items removed. Stopping to prevent infinite loop.`);
      }

    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Handle delete confirmation popup
   */
  private async handleRemoveConfirmationPopup() {
    try {
      await expect(this.removeConfirmPopup).toBeVisible({ timeout: TIMEOUTS.SHORT });
      const confirmButton = this.removeConfirmPopup.locator(this.removeCartitem);
      await expect(confirmButton).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await confirmButton.click();
      // Wait for popup to disappear after confirmation
      await expect(this.removeConfirmPopup).not.toBeVisible({ timeout: TIMEOUTS.SHORT });
    } catch (popupError) {
      // No confirmation popup detected, proceeding normally
    }
  }

  /**
   * Click checkout button to navigate to checkout page
   */
  async clickCheckoutButton() {
    try {
      // Wait until checkout button is visible
      await expect(this.checkoutButton).toBeVisible({ timeout: TIMEOUTS.STANDARD });

      // Click checkout button
      await this.checkoutButton.click();

    } catch (error: any) {
      throw new Error(`Checkout button click failed: ${error.message}`);
    }
  }

  /**
   * Click guest checkout button
   */
  async clickGuestCheckoutButton() {
    try {
      // Find guest checkout button (for AU site)
      const guestCheckoutBtn = this.page.locator('button[data-an-tr="cart-to-checkout"], button.guest-checkout-btn').last();

      // Wait until button is visible
      await expect(guestCheckoutBtn).toBeVisible({ timeout: TIMEOUTS.STANDARD });

      // Click guest checkout button
      await guestCheckoutBtn.click();

    } catch (error: any) {
      throw new Error(`Guest checkout button click failed: ${error.message}`);
    }
  }

  /**
   * Perform cart cleanup after test
   * @param baseUrl - Base URL
   * @param siteCode - Site code
   */
  async cleanupCart(baseUrl: string, siteCode: string) {
    try {
      // Check if current page is cart page, if not navigate to cart page
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/cart')) {
        const cartUrl = baseUrl + '/' + siteCode + '/cart';
        await this.page.goto(cartUrl);
        // Wait for cart page to load completely
        await this.cartArea.waitFor({ timeout: TIMEOUTS.STANDARD });
      }

      // Attempt to remove cart items
      await this.removeAllCartItems();
    } catch (cleanupError: any) {
      console.warn('Cart cleanup failed:', cleanupError.message);
    }
  }

  /**
   * Click first recommended item when cart is empty
   */
  async clickRecommendedItem() {
    try {
      // Wait until recommended items are loaded (first element only)
      await expect(this.RecomendItem.first()).toBeVisible({ timeout: TIMEOUTS.STANDARD });

      // Check recommended item count
      const recommendedItemCount = await this.RecomendItem.count();

      if (recommendedItemCount === 0) {
        throw new Error('No recommended items found');
      }

      // Click first recommended item (index 0)
      const firstRecommendedItem = this.RecomendItem.nth(0);
      await expect(firstRecommendedItem).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await firstRecommendedItem.click();

      // Wait for page loading after click
      await this.page.waitForURL('**/cart**', { timeout: TIMEOUTS.STANDARD });

    } catch (error: any) {
      throw new Error(`Recommended item click failed: ${error.message}`);
    }
  }

  /**
   * Verify that payment list is not displayed (Prod_Cart_01)
   */
  async verifyPaymentListNotDisplayed() {
    try {
      await expect(this.paymentList).not.toBeVisible({ timeout: TIMEOUTS.STANDARD });
    } catch (error: any) {
      throw new Error(`Payment list not displayed: ${error.message}`);
    }
  }


  async getCartItemQuantity(sku: string) {
    try {
      const quantityLocator = `cx-cart-item-list-v2 .cart-item[data-modelcode="${sku}"] .cart-item__quantity input,
.cart-product-list .cart-row[data-modelcode="${sku}"] input[name='quantity'],
cx-cart-item-list-v2 .cart-item[data-modelcode="${sku}"] .cart-item__quantity--without-disc input,
app-cart-item-cn .cart-item[data-modelcode="${sku}"] input`;

      const quantityInput = this.page.locator(quantityLocator);
      await expect(quantityInput).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      const quantity = await quantityInput.inputValue();
      return quantity;

    } catch (error: any) {
      throw new Error(`Failed to get cart item quantity for SKU ${sku}: ${error.message}`);
    }
  }

  async clickIncreaseQuantityButton(sku: string): Promise<void> {
    try {
      const increaseButtonLocator = `cx-cart-item-list-v2 .cart-item[data-modelcode="${sku}"] .cart-item__quantity button:last-child,
.cart-product-list .cart-row[data-modelcode="${sku}"] .qty-selector button[data-an-tr="move-to-cart"],
cx-cart-item-list-v2 .cart-item[data-modelcode="${sku}"] .cart-item__quantity--without-disc button:last-child`;

      const increaseButton = this.page.locator(increaseButtonLocator);
      await expect(increaseButton).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await increaseButton.click();

    } catch (error: any) {
      throw new Error(`Failed to click increase quantity button for SKU ${sku}: ${error.message}`);
    }
  }

  async clickDecreaseQuantityButton(sku: string): Promise<void> {
    try {
      const decreaseButtonLocator = `cx-cart-item-list-v2 .cart-item[data-modelcode="${sku}"] .cart-item__quantity button:first-child,
.cart-product-list .cart-row[data-modelcode="${sku}"] .qty-selector button[data-an-tr="decrease"],
cx-cart-item-list-v2 .cart-item[data-modelcode="${sku}"] .cart-item__quantity--without-disc button:first-child`;

      const decreaseButton = this.page.locator(decreaseButtonLocator);
      await expect(decreaseButton).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await decreaseButton.click();

    } catch (error: any) {
      throw new Error(`Failed to click decrease quantity button for SKU ${sku}: ${error.message}`);
    }
  }

  /**
   * Verify that quantity increase works properly (Prod_Cart_02)
   * @param sku - Cart item SKU
   * @returns Quantity increase success status
   */
  async verifyQuantityIncrease(sku: string): Promise<boolean> {
    try {
      // Store current quantity
      const currentQuantity = parseInt(await this.getCartItemQuantity(sku));

      await this.clickIncreaseQuantityButton(sku);

      const newQuantity = parseInt(await this.getCartItemQuantity(sku));

      if (newQuantity === currentQuantity + 1) {
        return true;
      } else {
        return false;
      }

    } catch (error: any) {
      return false;
    }
  }

  /**
   * Verify that quantity decrease works properly (Prod_Cart_02)
   * @param sku - Cart item SKU
   * @returns Quantity decrease success status
   */
  async verifyQuantityDecrease(sku: string): Promise<boolean> {
    try {
      const currentQuantity = parseInt(await this.getCartItemQuantity(sku));

      // Cannot decrease if quantity is less than or equal to 1
      if (currentQuantity <= 1) {
        return true; // Treat as success since it's minimum quantity
      }

      await this.clickDecreaseQuantityButton(sku);

      const newQuantity = parseInt(await this.getCartItemQuantity(sku));

      if (newQuantity === currentQuantity - 1) {
        return true;
      } else {
        return false;
      }

    } catch (error: any) {
      return false;
    }
  }


  async verifyQuantityChangeCycle(sku: string): Promise<void> {
    try {
      const initialQuantity = parseInt(await this.getCartItemQuantity(sku));

      const increaseSuccess = await this.verifyQuantityIncrease(sku);
      if (!increaseSuccess) {
        throw new Error(`Quantity increase failed for SKU ${sku}`);
      }

      const decreaseSuccess = await this.verifyQuantityDecrease(sku);
      if (!decreaseSuccess) {
        throw new Error(`Quantity decrease failed for SKU ${sku}`);
      }

    } catch (error: any) {
      const errorMessage = `Quantity change cycle verification failed for SKU ${sku}: ${error.message}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Verify that order summary is visible (Prod_Cart_03)
   */
  async verifyOrderSummaryInCart() {
    try {
      await expect(this.orderSummary_area.first()).toBeVisible({ timeout: TIMEOUTS.STANDARD });
    } catch (error: any) {
      throw new Error(`Order summary not displayed: ${error.message}`);
    }
  }

  /**
   * Verify that PayPal Express button is visible after adding SC+ (Prod_Cart_09)
   */
  async verifyPaypalExpress() {
    try {
      await expect(this.paypalExpress).toBeVisible({ timeout: TIMEOUTS.STANDARD });
    } catch (error: any) {
      throw new Error(`PayPal express not displayed: ${error.message}`);
    }
  }

  async isTradeUpOptionSelectable(): Promise<boolean> {
    try {
      await this.btnAddTradeUp.scrollIntoViewIfNeeded();
      const isVisible = await this.btnAddTradeUp.isVisible().catch(() => false);
      return isVisible;
    } catch (error: any) {
      return false;
    }
  }

  async addTradeUp(data: TradeUpSiteData): Promise<void> {
    try {
      if (!this.tradeUpPopup) {
        throw new Error('TradeUpPopup is not initialized. Config with siteCode is required.');
      }

      console.log(`🔄 Adding Trade-up in Cart for site: ${this.tradeUpPopup['siteCode']}`);

      // Wait for trade-up button to be ready and click it
      await this.btnAddTradeUp.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
      await expect(this.btnAddTradeUp).toBeEnabled({ timeout: TIMEOUTS.STANDARD });
      await this.btnAddTradeUp.click();

      // Wait for Trade-up popup to open
      await this.tradeUpPopup.waitForTradeUpPopupOpened();

      // Prepare trade-up data with postal code if needed
      const tradeUpData = {
        postalCode: data?.PostalCode || data?.postalCode,
        model: data?.model,
        brand: data?.brand
      };

      // Execute the complete trade-up flow using the Cart-specific method
      // Site-specific settings are automatically applied by TradeUpPopup
      await this.tradeUpPopup.executeTradeUpFlowFromCart(tradeUpData);

      console.log(`✅ Trade-up added successfully in Cart for site: ${this.tradeUpPopup['siteCode']}`);
    } catch (error: any) {
      throw new Error(`Failed to add Trade-up: ${error.message}`);
    }
  }

  /**
   * Verify that Trade-up is added by SKU
   */
  async verifyTradeUpAddedBySKU(SKU: string): Promise<void> {
    try {
      const tradeUpRemoveButton = this.page.locator(`
      .cart-item.ng-star-inserted[data-modelcode='${SKU}'] .service-item__trade-up [data-an-tr="cart-product-remove"],
      [data-an-sc='card-cart-product'][data-modelcode='${SKU}'] #as-tradeup .remove,
      .cart-item.ng-star-inserted[data-modelcode='${SKU}'] .service-item[data-modelcode="TRADE-UP"] [data-an-tr="cart-product-remove"],
      .cart-item[data-modelcode="${SKU}"]:has([data-an-la="tradeinTv:learn more"]) .action-button[data-an-tr="product-option"],
      .cart-item.ng-star-inserted[data-modelcode='${SKU}'] .service-item[data-modelcode="TRADE-UP"] [data-an-tr="product-option"][data-an-la="remove item"]
    `);

      // Wait for the trade-up remove button to be visible
      await expect(tradeUpRemoveButton).toBeVisible({ timeout: TIMEOUTS.LONG });
    } catch (error: any) {
      throw new Error(`Failed to verify Trade-up added for SKU ${SKU}: ${error.message}`);
    }
  }

}  
