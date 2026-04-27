import { Page, Locator, expect } from '@playwright/test';
import { Utils } from './Utils';
import { TIMEOUTS, DELAYS } from './Utils';
import tradeUpConfig from '../data/TradeUp/TradeUp.json';

interface TradeUpData {
    model?: string;
    brand?: string;
    postalCode?: string;
}

export class TradeUpPopup {
    private page: Page;
    private utils: Utils;
    private siteCode: string;
    private pageType: string;

    constructor(page: Page, siteCode: string, pageType: string) {
        this.page = page;
        this.utils = new Utils(page);
        this.siteCode = siteCode.toUpperCase();
        this.pageType = pageType;
    }

    private getSelector(selectorName: string): string {
        // Get page-specific base selectors
        const pageSelectors = (tradeUpConfig.pageTypes as any)[this.pageType]?.baseSelectors;
        const siteConfig = (tradeUpConfig.sites as any)[this.siteCode] || {};

        // Use site-specific selector if available, otherwise fall back to page base selector
        if (siteConfig.customSelectors && siteConfig.customSelectors[selectorName]) {
            return siteConfig.customSelectors[selectorName];
        }
        return (pageSelectors as any)[selectorName];
    }

    private getSiteConfig(): any {
        const defaultConfig = tradeUpConfig.defaults;
        const siteConfig = (tradeUpConfig.sites as any)[this.siteCode] || {};

        return {
            requiresPostalCode: siteConfig.requiresPostalCode ?? defaultConfig.requiresPostalCode,
            postalCodeInput: siteConfig.postalCodeInput,
            postalCodeButton: siteConfig.postalCodeButton
        };
    }

    /**
     * Clicks the Trade-up "Yes" option
     */
    async clickAddTradeUp(): Promise<void> {
        try {
            const selector = this.getSelector('tradeUpYesOption');
            await this.page.locator(selector).waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await this.page.locator(selector).click();
        } catch (error: any) {
            console.error(`❌ Failed to click Trade-up option: ${error.message}`);
            throw new Error(`Failed to click Trade-up option: ${error.message}`);
        }
    }

    /**
     * Waits for Trade-up popup to open
     */
    async waitForTradeUpPopupOpened(timeout: number = 3000): Promise<void> {
        try {
            const selector = this.getSelector('tradeUpPopup');
            await this.page.locator(selector).first().waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
        } catch (error: any) {
            console.error(`❌ Trade-up popup did not open: ${error.message}`);
            throw new Error(`Trade-up popup did not open: ${error.message}`);
        }
    }

    /**
     * Enters postal code for countries that require it
     * Automatically detects if postal code is required based on site configuration
     */
    async enterPostalCode(postalCode: string): Promise<void> {
        try {
            const siteConfig = this.getSiteConfig();

            if (!siteConfig.requiresPostalCode) {
                console.log(`ℹ Postal code not required for site: ${this.siteCode}`);
                return;
            }

            if (!siteConfig.postalCodeInput || !siteConfig.postalCodeButton) {
                console.log(`ℹ Postal code input not configured for site: ${this.siteCode}`);
                return;
            }

            console.log(` Entering postal code for ${this.siteCode}: ${postalCode}`);

            const postalCodeInput = this.page.locator(siteConfig.postalCodeInput);
            const postalCodeButton = this.page.locator(siteConfig.postalCodeButton);

            await postalCodeInput.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await postalCodeInput.clear();
            await postalCodeInput.type(postalCode, { delay: 50 });
            await postalCodeInput.blur();
            await this.page.waitForTimeout(500);

            await postalCodeButton.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await postalCodeButton.click();

            console.log(` Postal code entered successfully for ${this.siteCode}`);
        } catch (error: any) {
            console.error(` Failed to enter postal code: ${error.message}`);
            throw new Error(`Failed to enter postal code: ${error.message}`);
        }
    }


    /**
     * Selects model by index (clicks dropdown and selects first option)
     */
    async selectModelByIndex(index: number): Promise<void> {
        try {
            const modelDropdownSelector = this.getSelector('modelDropdownButton');
            const modelDropdownButton = this.page.locator(modelDropdownSelector);

            const isDropdownVisible = await modelDropdownButton.isVisible().catch(() => false);

            if (isDropdownVisible) {
                await modelDropdownButton.waitFor({ state: 'visible' });
                await this.page.waitForTimeout(DELAYS.SHORT);
                await this.utils.scrollClick(modelDropdownButton);
                await this.page.waitForTimeout(DELAYS.STANDARD);

                const modelOptionSelector = this.getSelector('getModelOption').replace(/%s/g, index.toString());
                const firstOption = this.page.locator(modelOptionSelector);
                await firstOption.waitFor({ state: 'visible' });
                await this.utils.scrollClick(firstOption);
                await this.page.waitForTimeout(DELAYS.SHORT);
            }
        } catch (error: any) {
            console.error(` Failed to select model: ${error.message}`);
            throw new Error(`Failed to select model: ${error.message}`);
        }
    }

    /**
     * Selects brand by index (clicks dropdown and selects first option)
     */
    async selectBrandByIndex(index: number): Promise<void> {
        try {
            const brandDropdownSelector = this.getSelector('brandDropdownButton');
            const brandDropdownButton = this.page.locator(brandDropdownSelector);

            const isDropdownVisible = await brandDropdownButton.isVisible().catch(() => false);

            if (isDropdownVisible) {
                await brandDropdownButton.waitFor({ state: 'visible' });
                await this.page.waitForTimeout(DELAYS.SHORT);
                await this.utils.scrollClick(brandDropdownButton);
                await this.page.waitForTimeout(DELAYS.STANDARD);

                const brandOptionSelector = this.getSelector('getBrandOption').replace(/%s/g, index.toString());
                const firstBrandOption = this.page.locator(brandOptionSelector);
                await firstBrandOption.waitFor({ state: 'visible' });
                await this.utils.scrollClick(firstBrandOption);
                await this.page.waitForTimeout(DELAYS.SHORT);
            }
        } catch (error: any) {
            console.error(` Failed to select brand: ${error.message}`);
            throw new Error(`Failed to select brand: ${error.message}`);
        }
    }


    /**
     * Clicks Continue/Next button
     */
    async clickContinueButton(): Promise<void> {
        try {
            const selector = this.getSelector('continueButton');
            const button = this.page.locator(selector);
            const isVisible = await button.isVisible().catch(() => false);

            if (isVisible) {
                await this.utils.scrollClick(button);
            }
        } catch (error: any) {
            console.error(` Failed to click Continue button: ${error.message}`);
            throw new Error(`Failed to click Continue button: ${error.message}`);
        }
    }

    /**
     * Clicks condition check next step button
     */
    async clickConditionNextButton(): Promise<void> {
        try {
            const selector = this.getSelector('conditionNextButton');
            const button = this.page.locator(selector);
            const isVisible = await button.isVisible().catch(() => false);

            if (isVisible) {
                await this.utils.scrollClick(button);
            }
        } catch (error: any) {
            console.error(` Failed to click condition next button: ${error.message}`);
            throw new Error(`Failed to click condition next button: ${error.message}`);
        }
    }

    /**
     * Selects terms agreement checkbox
     */
    async selectTermsAgreement(): Promise<void> {
        try {
            await this.page.waitForTimeout(DELAYS.SHORT);
            const selector = this.getSelector('termsAgreementCheckbox');
            const checkbox = this.page.locator(selector);
            const isVisible = await checkbox.isVisible().catch(() => false);

            if (isVisible) {
                await checkbox.click({ force: true });
            }
        } catch (error: any) {
            console.error(` Failed to select terms agreement: ${error.message}`);
            throw new Error(`Failed to select terms agreement: ${error.message}`);
        }
    }

    /**
     * Clicks Apply Trade-up button
     */
    async clickApplyTradeUpButton(): Promise<void> {
        try {
            const selector = this.getSelector('applyTradeUpButton');
            const button = this.page.locator(selector);
            const isVisible = await button.isVisible().catch(() => false);

            if (isVisible) {
                await this.utils.scrollClick(button);
            }
        } catch (error: any) {
            console.error(` Failed to click Apply Trade-up button: ${error.message}`);
            throw new Error(`Failed to click Apply Trade-up button: ${error.message}`);
        }
    }

    /**
     * Selects condition Yes option
     */
    async selectConditionYes(): Promise<void> {
        try {
            await this.page.waitForTimeout(DELAYS.SHORT);
            const selector = this.getSelector('conditionYesLabel');
            const label = this.page.locator(selector);
            const isVisible = await label.isVisible().catch(() => false);

            if (isVisible) {
                await this.utils.scrollClick(label);
            }
        } catch (error: any) {
            console.error(`❌ Failed to select condition Yes: ${error.message}`);
            throw new Error(`Failed to select condition Yes: ${error.message}`);
        }
    }

    /**
     * Executes the complete Trade-up flow
     * @param data - Trade-up data including postal code if needed
     */
    async executeTradeUpFlow(data?: TradeUpData): Promise<void> {
        try {
            console.log(` Starting Trade-up flow for site: ${this.siteCode}`);

            // Step 1: Click Trade-up option
            await this.clickAddTradeUp();
            await this.waitForTradeUpPopupOpened();

            // Step 2: Handle postal code if required
            const siteConfig = this.getSiteConfig();
            if (siteConfig.requiresPostalCode && data?.postalCode) {
                await this.enterPostalCode(data.postalCode);
            } else if (siteConfig.requiresPostalCode && !data?.postalCode) {
                console.warn(` Postal code required for ${this.siteCode} but not provided`);
            }

            // Step 3: Select model and brand (first options)
            await this.selectModelByIndex(1);
            await this.selectBrandByIndex(1);
            await this.clickContinueButton();

            // Step 4: Select condition and proceed
            await this.selectConditionYes();
            await this.clickConditionNextButton();

            // Step 5: Accept terms and apply
            await this.selectTermsAgreement();
            await this.clickApplyTradeUpButton();

            console.log(`Trade-up flow completed successfully for site: ${this.siteCode}`);
        } catch (error: any) {
            console.error(`❌ Trade-up flow failed: ${error.message}`);
            throw new Error(`Trade-up flow failed: ${error.message}`);
        }
    }

    /**
     * Executes Trade-up flow for Cart page (popup already opened)
     * @param data - Trade-up data including postal code if needed
     */
    async executeTradeUpFlowFromCart(data?: TradeUpData): Promise<void> {
        try {
            console.log(` Starting Trade-up flow from Cart for site: ${this.siteCode}`);

            // Step 1: Handle postal code if required (popup already opened)
            const siteConfig = this.getSiteConfig();
            if (siteConfig.requiresPostalCode && data?.postalCode) {
                await this.enterPostalCode(data.postalCode);
            } else if (siteConfig.requiresPostalCode && !data?.postalCode) {
                console.warn(` Postal code required for ${this.siteCode} but not provided`);
            }

            // Step 2: Select model and brand (first options)
            await this.selectModelByIndex(1);
            await this.selectBrandByIndex(1);
            await this.clickContinueButton();

            // Step 3: Select condition and proceed
            await this.selectConditionYes();
            await this.clickConditionNextButton();

            // Step 4: Accept terms and apply
            await this.selectTermsAgreement();
            await this.clickApplyTradeUpButton();

            console.log(`Trade-up flow completed successfully from Cart for site: ${this.siteCode}`);
        } catch (error: any) {
            console.error(`❌ Trade-up flow from Cart failed: ${error.message}`);
            throw new Error(`Trade-up flow from Cart failed: ${error.message}`);
        }
    }

    /**
     * Get supported site codes for Trade-up
     * @returns Array of supported site codes
     */
    static getSupportedSites(): string[] {
        return Object.keys(tradeUpConfig.sites);
    }

    /**
     * Check if a site is supported for Trade-up
     * @param siteCode - Site code to check
     * @returns True if site is supported
     */
    static isSiteSupported(siteCode: string): boolean {
        return siteCode.toUpperCase() in tradeUpConfig.sites;
    }
}