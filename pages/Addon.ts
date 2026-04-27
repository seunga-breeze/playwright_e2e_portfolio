import { Page, Locator, expect } from '@playwright/test';
import { DELAYS, TIMEOUTS } from './Utils';

export class AddonPage {
  readonly page: Page;
  readonly btnContinue: Locator;
  readonly btnEvoucherContinue: Locator;
  readonly btnFreeGiftContinue: Locator;
  readonly popupAddon: Locator;
  readonly btnPopupSkip: Locator;
  readonly btnAddItem: Locator;
  readonly checkboxTnC: Locator;

  constructor(page: Page) {
    this.page = page;
    this.btnContinue = page.locator('a[an-la="add-on:continue"], a[an-la="evoucher:continue"], a[an-la="add-on:go to cart"]');
    this.btnEvoucherContinue = page.locator('a[an-la="evoucher:continue"], a[an-la="evoucher:over evoucher:continue"]');
    this.btnFreeGiftContinue = page.locator('a[an-la="free gift:continue"], #giftContinue[an-la="add-on:continue"]');
    this.popupAddon = page.locator('div.confirm-popup__content-inner');
    this.btnPopupSkip = page.locator('button[an-la="evoucher:no addition:skip"]');
    this.btnAddItem = page.locator('button[an-la="add-on:add item"], ' +
      'button[an-la="evoucher:add item"], ' +
      '.wearable-addon-page [an-la="add item"], ' +
      'button[an-la^="add-on:"][an-la$=":add item"], ' +
      'button[an-la^="evoucher:"][an-la$=":add item"], ' +
      'button[an-la*="bridge:add-on"], ' +
      'button[an-la*="add item"]');
    this.checkboxTnC = page.locator('.hubble-addon-page__confirm-terms input[type="checkbox"]');
  }

  async handlePopupInAddon(): Promise<boolean> {
    try {
      console.log('Checking for addon popup...');
      
      const isPopupVisible = await this.popupAddon.isVisible({ timeout: TIMEOUTS.STANDARD });
      if (isPopupVisible) {
        console.log('Addon popup detected, clicking Skip...');
        await this.btnPopupSkip.click();
        await this.page.waitForTimeout(DELAYS.SHORT);
        console.log('Skip button clicked');
        return true;
      }
      
      console.log('No addon popup found');
      return false;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('Addon popup handling failed:', errorMessage);
      return false;
    }
  }

  async skipFreeGift(): Promise<boolean> {
    try {
      const isVisible = await this.btnFreeGiftContinue.isVisible({ timeout: TIMEOUTS.SHORT });
      if (isVisible) {
        await expect(this.btnFreeGiftContinue).toBeEnabled({ timeout: TIMEOUTS.SHORT });
        await this.btnFreeGiftContinue.click();
        await this.page.waitForTimeout(DELAYS.STANDARD);
        console.log('Free gift page skipped');
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.log('Free gift skip failed or not found');
      return false;
    }
  }

  async clickEvoucherContinueIfExists() {
    try {
      const isVisible = await this.btnEvoucherContinue.isVisible({ timeout: TIMEOUTS.SHORT });
      if (isVisible) {
        await expect(this.btnEvoucherContinue).toBeEnabled({ timeout: TIMEOUTS.SHORT });
        await this.btnEvoucherContinue.click();
        await this.page.waitForTimeout(DELAYS.STANDARD);
        console.log('Evoucher continue button clicked');
      }
    } catch (error) {
      console.log('Evoucher continue button not found or not clickable');
    }
  }

  async clickContinue() {
    await expect(this.btnContinue).toBeVisible({ timeout: TIMEOUTS.STANDARD });
    await expect(this.btnContinue).toBeEnabled({ timeout: TIMEOUTS.STANDARD });
    await this.btnContinue.click();
    await this.page.waitForTimeout(DELAYS.STANDARD);
    console.log('Continue button clicked');
  }

  async clickAllContinueButtons() {
    await this.skipFreeGift();
    await this.clickEvoucherContinueIfExists();
    await this.clickContinue();
  }

  async isContinueButtonVisible() {
    try {
      await this.btnContinue.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
      return true;
    } catch {
      return false;
    }
  }

  async handleAddonPage() {
    console.log('Handling addon page...');
    const isContinueVisible = await this.isContinueButtonVisible();

    if (isContinueVisible) {
      await expect(this.btnContinue).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await this.clickContinue();

      await this.handlePopupInAddon();

      console.log('Addon page handled successfully');
    } else {
      console.log('Addon page not found, proceeding to next step');
    }
  }

  /**
   * Navigate to addon selection page by handling intermediate steps
   * Uses Playwright's expect.poll for robust waiting and automatic retries
   * @throws {Error} When unable to navigate to addon selection page within timeout
   */
  async navigateToAddon(): Promise<void> {
    try {
      console.log('Navigating to addon selection page...');
      
      await expect.poll(async () => {
        if (await this.btnContinue.isVisible({ timeout: TIMEOUTS.STANDARD })) {
          console.log('Addon page detected - continue button is available');
          return 'reached';
        }

        await this.checkTnC();

        const freeGiftSkipped = await this.skipFreeGift();
        if (freeGiftSkipped) {
          return 'continue';
        }

        return 'continue';
      }, {
        timeout: TIMEOUTS.STANDARD * 2,
        message: 'Waiting for addon selection page to be reached'
      }).toBe('reached');

      console.log('Successfully navigated to addon selection page');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to navigate to addon selection page:', errorMessage);
      throw new Error(`Unable to navigate to addon selection page: ${errorMessage}`);
    }
  }

  private async checkTnC(): Promise<void> {
    try {
      const checkboxes = await this.checkboxTnC.all();
      
      for (const checkbox of checkboxes) {
        if (await checkbox.isVisible()) {
          const isChecked = await checkbox.isChecked();
          if (!isChecked) {
            console.log('Checking terms and conditions checkbox...');
            await checkbox.check();
            await this.page.waitForTimeout(DELAYS.SHORT);
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('Terms and conditions handling completed with warning:', errorMessage);
    }
  }

  /**
   * Select first addon item and return model code
   * @returns {Promise<string | null>} Selected item's data-modelcode value or null
   */
  async selectFirstItem(): Promise<string | null> {
    try {
      console.log('Selecting first addon item...');
      
      const firstItem = this.btnAddItem.first();
      
      const modelCode = await firstItem.getAttribute('data-modelcode');
      if (!modelCode) {
        throw new Error('Model code attribute not found');
      }
      
      await firstItem.click();
      
      console.log(`Item selected with model code: ${modelCode}`);
      return modelCode;
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('Item selection failed:', errorMessage);
      return null;
    }
  }

}
