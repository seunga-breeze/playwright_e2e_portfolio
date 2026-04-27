import { Page, Locator, expect } from '@playwright/test';
import { DELAYS, TIMEOUTS, Utils } from './Utils';

export class InstallmentPlanPage {
    readonly cbxTermAndConditions: Locator;
    readonly installmentPlanArea: Locator;
    readonly addToInstallmentPlanBtn: Locator;
    readonly removeInstallmentPlanBtn: Locator;
    readonly installmentPlanModal: Locator;
    readonly btnConfirmInstallmentPlanPopup: Locator;

    constructor(page: Page) {
        this.cbxTermAndConditions = page.locator('.hubble-upgrade-popup__check-list .checkbox-v2');
        this.installmentPlanArea = page.locator(`app-upgrade-plan-v2.modal`);
        this.addToInstallmentPlanBtn = page.locator('[data-an-la="installment-plan:add to cart"]');
        this.removeInstallmentPlanBtn = page.locator(`.s-btn-encased.is-delete[an-la="upgrade program:remove"],
.action-button.ng-star-inserted[data-an-tr="cart-product-remove"],
.is-delete[an-la="eup:remove"],
[data-modeldisplay="Upgrade Plan"] [data-an-la="remove item"]`);
        this.installmentPlanModal = page.locator('.hubble-upgrade-popup');
        this.btnConfirmInstallmentPlanPopup = page.locator('[an-la="upgrade program:confirm"]');
    }

    async addInstallmentPlanInCart() {
        try {
          await expect(this.installmentPlanArea).toBeVisible({ timeout: TIMEOUTS.SHORT });

            try {
                const termCheckboxes = this.cbxTermAndConditions;
                const checkboxCount = await termCheckboxes.count();

                for (let i = 0; i < checkboxCount; i++) {
                const checkbox = termCheckboxes.nth(i);
                const isVisible = await checkbox.isVisible();

                if (isVisible) {
                    await checkbox.scrollIntoViewIfNeeded();

                    const box = await checkbox.boundingBox();
                    if (box) {
                    const xOffset = Math.round(12 - box.width / 2);
                    const yOffset = Math.round(12 - box.height / 2);

                    await checkbox.click({
                        position: { x: xOffset, y: yOffset },
                        force: true
                    });
                    } else {
                    await checkbox.click({ force: true });
                    }
                }
                }
          } catch (checkboxError: any) {
            throw new Error(`Unable to check terms and conditions: ${checkboxError.message}`);
          }

          await expect(this.addToInstallmentPlanBtn).toBeVisible({ timeout: TIMEOUTS.SHORT });
          await this.addToInstallmentPlanBtn.click();

        } catch (error: any) {
          throw error;
        }
    }

    async waitForOpenedInstallmentPlanPopup() {
        await expect(this.installmentPlanModal).toBeVisible({ timeout: TIMEOUTS.SHORT });
    }

    async clickConfirmInstallmentPlanPopup() {
        await expect(this.btnConfirmInstallmentPlanPopup).toBeVisible({ timeout: TIMEOUTS.SHORT });
        await this.btnConfirmInstallmentPlanPopup.click();
    }

    async verifyInstallmentPlanRemoveBtn() {
        await expect(this.removeInstallmentPlanBtn).toBeVisible({ timeout: TIMEOUTS.SHORT });
    }
}
