import { Page, Locator, expect } from '@playwright/test';
import { DELAYS, TIMEOUTS, Utils } from './Utils';

export class ProtectionPlanPage {
  readonly page: Page;
  private utils: Utils;

  // 1.BC Page
  readonly planOption: Locator;
  readonly planOptionPayment: Locator;
  readonly planPopupAddBtn: Locator;
  readonly planOptionPaymentWatch: Locator;

  // 2.Cart Page
  readonly planAddBtn: Locator;
  readonly planOptionList: Locator;
  readonly planPriceArea: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new Utils(page);

    // 1.BC Page
    this.planOption = page.locator(`.hubble-product__options-list-wrap:not([style*="hidden"]) .js-smc,
.wearable-option.option-care li:not(.depth-two) button:not([an-la*='none']),
.plan-list .insurance__item--yes`);
    this.planOptionPayment = page.locator(`.hubble-product__options-payment .s-option-box[aria-disabled="false"],
.wearable-option.option-care li.depth-two[aria-disabled="false"]`);
    this.planOptionPaymentWatch = page.locator(`.hubble-product__options-payment .s-option-box,.wearable-option.option-care li.depth-two`);

    this.planPopupAddBtn = page.locator(`button[an-la="protection-plan:confirm"],button[data-an-la="protection-plan:add to cart"],app-protection-plan-v2 .modal__footer button[type="submit"],button[data-an-la="protection-plan:confirm"]`);

    // 2.Cart Page
    this.planAddBtn = page.locator('.hubble-product__options-payment .s-option-box:visible, .wearable-option.option-care li.depth-two:visible');

    this.planPriceArea = page.locator(`
      [data-pimsubtype='protection-plan'] .action-text,
      [data-pimsubtype='insurance'] .action-text,
      [data-pimsubtype='insurance'] .as-price,
      p.shopping-c-i-h-c-offer-r-p,
      [data-visubtype='protection-plan'] .free-price,
      [data-modeldisplay*='Protection Plan'] .action-text,
      .as-price.hasNewKZTradeIn,
      div[data-modeldisplay*="PP"] > div[class*="item__actions"] > div,
      div[data-modeldisplay="Protection Plan"] span[class*="free-price"],
      div[data-modeldisplay="PP"] div[class*="price"],
      div[data-modeldisplay*='优惠换屏'] div[class*='smc']
    `);

    this.planOptionList = page.locator(`app-protection-plan-v2 mat-radio-group mat-radio-button div.option-box__price,
    .service-list-selector[ng-if*='displayPlanProduct'],
    app-protection-plan mat-radio-group mat-radio-button`);
  }

  // ===== Main Methods =====

  async addProtectionPlanOptionsInBC(isWatch: boolean = false) {
    const firstPlanOption = this.planOption.first();
    await expect(firstPlanOption).toBeVisible({ timeout: TIMEOUTS.SHORT });
    await firstPlanOption.click();

    try {
      const optionLocator = isWatch ? this.planOptionPaymentWatch : this.planOptionPayment;
      const visibleOption = await optionLocator.filter({ has: this.page.locator(':visible') }).first();
      await visibleOption.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });
      await visibleOption.click();
    } catch (error: any) {
      console.log('Protection plan options not available, skipping...');
    }
  }

  async addProtectionPlanOptionsInCart(type: string) {
    try {
      await this.page.waitForTimeout(DELAYS.STANDARD);

      const allOptions = this.planOptionList.filter({ has: this.page.locator(':visible') });

      let planOptionList;

      if (type === 'standard') {
        planOptionList = allOptions.filter({ hasText: /^(?!.*\/).*$/ }).first();
      } else {
        planOptionList = allOptions.filter({ hasText: /\/.*$/ }).first();
      }

      if (planOptionList) {
        await planOptionList.click();
        console.log('Protection plan option clicked');
      } else {
        const availableOptions = await this.planOptionList.filter({ has: this.page.locator(':visible') }).count();
        throw new Error(`Option '${type}' is not visible. Available options: ${availableOptions}`);
      }

      console.log('=== Protection Plan TnC click ===');
      await this.checkAllTermsAndConditions();
      console.log('=== Protection Plan TnC check completed ===');

      const addPlanBtn = this.planPopupAddBtn.first();
      await expect(addPlanBtn).toBeVisible({ timeout: TIMEOUTS.SHORT });
      await addPlanBtn.click();

    } catch (error: any) {
      throw error;
    }
  }

  async addProtectionPlanPopupInBC() {
    try {
      console.log('=== Protection Plan TnC click ===');
      await this.checkAllTermsAndConditions();
      console.log('=== Protection Plan TnC check completed ===');

      const addPlanBtn = this.planPopupAddBtn.first();
      await this.page.waitForTimeout(DELAYS.STANDARD);
      await expect(addPlanBtn).toBeVisible({ timeout: TIMEOUTS.STANDARD });
      await addPlanBtn.click();

    } catch (error: any) {
      throw error;
    }
  }

  async verifyPlanPriceArea(line: number) {
    await this.page.waitForTimeout(DELAYS.STANDARD);

    try {
      await expect(this.planPriceArea).toBeVisible({ timeout: TIMEOUTS.SHORT });
      const priceText = await this.planPriceArea.textContent();

      return true;

    } catch (error: any) {
      throw new Error(`Protection plan price area verification failed: ${error.message}`);
    }
  }

  async checkAllTermsAndConditions() {
    try {
      const altBoxSelector = 'li.tandc__item > input';
      const defBoxSelector = `
    .hubble-care-popup-new__check-list .checkbox-radio input,
    .plan-modal .tandc__item input,
    .js-added-services-container .added-services-terms .checkbox-square input,
    app-protection-plan-v2 mat-checkbox input[type="checkbox"],
    app-protection-plan-v2 mat-checkbox
    `.trim();

      let checkboxes: Locator | null = null;

      const alt = this.page.locator(altBoxSelector);
      const altCount = await alt.count();

      if (altCount > 0) {
        checkboxes = alt;
      } else {
        const def = this.page.locator(defBoxSelector);
        const defCount = await def.count();
        if (defCount > 0) {
          checkboxes = def;
        }
      }

      if (!checkboxes) {
        console.warn('No terms and conditions checkboxes found.');
        return;
      }

      const count = await checkboxes.count();
      let checkedCount = 0;

      for (let i = 0; i < count; i++) {
        const candidate = checkboxes.nth(i);

        const disabled = await candidate.getAttribute('disabled');
        const ariaDisabled = await candidate.getAttribute('aria-disabled');
        if (disabled !== null || ariaDisabled === 'true') {
          continue;
        }

        await candidate.scrollIntoViewIfNeeded().catch(() => {});

        const tagName = (await candidate.evaluate(el => el.tagName.toLowerCase()).catch(() => '')) || '';
        const typeAttr = (await candidate.getAttribute('type')) || '';
        const isCheckboxInput = tagName === 'input' && typeAttr.toLowerCase() === 'checkbox';

        try {
          if (isCheckboxInput) {
            const checked = await candidate.isChecked();
            if (!checked) {
              await candidate.check({ force: true });
              checkedCount++;
            }
          } else {
            const innerInput = candidate.locator('input[type="checkbox"]');
            if (await innerInput.count() > 0) {
              const already = await innerInput.first().isChecked();
              if (!already) {
                await innerInput.first().check({ force: true });
                checkedCount++;
              }
            } else {
              await candidate.click({ force: true });
              checkedCount++;
            }
          }
        } catch (error) {
          await candidate.click({ force: true }).catch(() => {});
          checkedCount++;
        }

        await this.page.waitForTimeout(300);
      }

      console.log(`TnC: Found ${count} checkboxes, checked ${checkedCount}`);
    } catch (error) {
      console.error(`Error in checkAllTermsAndConditions: ${error}`);
      throw new Error(`Unable to check terms and conditions: ${error}`);
    }
  }
}
