import { Page, Locator, expect } from '@playwright/test';
import { DELAYS, TIMEOUTS, Utils } from './Utils';


export class SIMPage {
    readonly page: Page;
    readonly utils: Utils;
    readonly btnAddSIM: Locator;
    readonly btnRemoveSIM: Locator;
    readonly optionPurchaseSIM: Locator;
    readonly simPopup: Locator;
    readonly optionPlan: Locator;
    readonly btnNext: Locator;
    readonly cbxTermsAndConditions: Locator;
    readonly clickConfirm: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils(page);
        this.btnAddSIM = page.locator(`.s-option-tariff [an-la="tariff:apply"],.option-tariff [an-la="tariff:yes"],.hubble-product__options-content__box-wrap-wrap [an-la="tariff:apply"]`);
        this.btnRemoveSIM = page.locator(`[data-pimsubtype="tariff"] [data-an-tr="cart-product-remove"],
[data-pimsubtype="tariff"] [data-an-la="remove item"],
.service-item[data-modelcode*="SIM"] [data-an-tr="cart-product-remove"],
.service-item[data-modelcode="AU_SIM_VODAFONE_SKU"] [data-an-la="remove item"],
.service-item[data-modelcode="DK_SIM_OISTER_SKU"] [data-an-la="remove item"],
.service-item[data-modelcode="SE_SIM_VIMLA_SKU"] [data-an-la="remove item"],
.service-item[data-modelcode="NO_SIM_CHILI_SKU"] [data-an-la="remove item"],
.service-item[data-modelcode="FR_SIM_BT_SKU"] [data-an-la="remove item"]`);
        this.optionPurchaseSIM = page.locator(`.s-option-box:has([an-la="purchase program:tariff"]),
.bc-tariff-popup .tariff-popup__radio [an-la*="tariff:select"]`);
        this.simPopup = page.locator(`.tariff-popup`);
        this.optionPlan = page.locator(`.tariff-popup__radio`);
        this.btnNext = page.locator(`.tariff-popup__btn-next`);
        this.cbxTermsAndConditions = page.locator(`div.tariff-popup__checkbox:has(> input[required])`);
        this.clickConfirm = page.locator(`.tariff-popup__btn-submit`);

    }

    async verifySIMRemoveBtn() {
        await expect(this.btnRemoveSIM).toBeVisible({ timeout: TIMEOUTS.SHORT });
    }

    async addSIMPopupInBC() {
        try {
            // Wait for SIM popup to appear
            await expect(this.simPopup).toBeVisible({ timeout: TIMEOUTS.STANDARD });
            
            // Select plan option
            await this.utils.scrollClick(this.optionPlan.first());
            
            // Click Next button
            await expect(this.btnNext).toBeVisible({ timeout: TIMEOUTS.SHORT });
            await this.utils.scrollClick(this.btnNext);
            
            await this.page.pause();

            // Handle terms and conditions if present (click div containers)
            const termsCount = await this.cbxTermsAndConditions.count();
            if (termsCount > 0) {
                for (let i = 0; i < termsCount; i++) {
                    const checkboxContainer = this.cbxTermsAndConditions.nth(i);
                    await this.utils.scrollClick(checkboxContainer);
                }
            }
            
            // Confirm SIM addition
            await expect(this.clickConfirm).toBeVisible({ timeout: TIMEOUTS.SHORT });
            await this.utils.scrollClick(this.clickConfirm);
            
        } catch (error: any) {
            throw new Error(`SIM popup processing failed: ${error.message}`);
        }
    }
    
}