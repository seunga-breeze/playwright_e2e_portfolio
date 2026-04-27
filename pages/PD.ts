import { Page, Locator, expect } from '@playwright/test';
import { Utils } from './Utils';
import { TIMEOUTS } from './Utils';
import { AddonPage } from './Addon';
import { TradeUpPopup } from './TradeUpPopup';
import { ProjectConfig, TradeUpSiteData } from '../types/config';

export class PD {
    private page: Page;
    private utils: Utils;
    private pdPageLocator: Locator;
    private buyNowButtonLocator: Locator;
    private addon: AddonPage;
    private skuLocator: Locator;
    private tradeUpPopup: TradeUpPopup;
    constructor(page: Page, config: ProjectConfig) {
        this.page = page;
        this.utils = new Utils(page);
        this.pdPageLocator = page.locator('.pd-g-product-detail-header-ux2');
        this.skuLocator = page.locator('p.pd-info__sku span.pd-info__sku-code, #anchorNavigationPriceBar [class*="sku"]');
        this.buyNowButtonLocator = page.locator('a[an-la="secondary navi:add to cart"], #sgDevPriceAreaBase a[an-la="anchor navi:buy now"], #sgDevPriceAreaBase a[an-la="anchor navi:add to cart"]');
        this.addon = new AddonPage(page);
        this.tradeUpPopup = new TradeUpPopup(page, config.siteCode, 'PD');

    }

    /**
     * Verifies that the PD page has loaded successfully
     * Checks if BUY NOW button is visible
     */
    async verifyPDPage() {
        try {
            await expect(this.buyNowButtonLocator).toBeVisible({ timeout: TIMEOUTS.STANDARD });
        } catch (error: any) {
            console.error(`❌ PD page verification failed: ${error.message}`);
            throw new Error(`PD page verification failed: ${error.message}`);
        }
    }

    /**
     * Checks if PD page is visible on screen
     * @param options - timeout: wait time (default 3s), log: whether to output logs
     * @returns PD page visibility status
     */
    async isPdVisible(options?: { timeout?: number; log?: boolean }): Promise<boolean> {
        try {
            await this.pdPageLocator.waitFor({ state: 'visible', timeout: options?.timeout ?? 10000 });
            if (options?.log) console.log('✅ PD page is visible');
            return true;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (options?.log) console.log('❌ PD page not visible:', errorMessage);
            return false;
        }
    }

    /**
     * Extracts current product SKU from PD page
     * @returns Promise<string> - Product SKU
     */
    async getSKU(): Promise<string> {
        try {
            await this.skuLocator.waitFor({ state: 'visible', timeout: 5000 });
            const sku = await this.skuLocator.textContent();

            if (!sku) {
                throw new Error('SKU text is empty');
            }

            const cleanSku = sku.trim()
            return cleanSku;
        } catch (error: any) {
            console.error(`❌ Unable to get current Product SKU: ${error.message}`);
            throw new Error(`Failed to get product SKU: ${error.message}`);
        }
    }

    async highlightSkuAndCapture(): Promise<Buffer> {
        await this.skuLocator.evaluate(el => {
            (el as HTMLElement).style.border = '3px solid red';
            (el as HTMLElement).style.backgroundColor = 'yellow';
            (el as HTMLElement).style.boxShadow = '0 0 10px red';
        });
        const screenshot = await this.page.screenshot();
        await this.skuLocator.evaluate(el => {
            (el as HTMLElement).style.border = '';
            (el as HTMLElement).style.backgroundColor = '';
            (el as HTMLElement).style.boxShadow = '';
        });
        return screenshot;
    }

    /**
     * Clicks BUY NOW button
     */
    async clickBuyNowButton() {
        try {
            await expect(this.buyNowButtonLocator).toBeVisible({ timeout: TIMEOUTS.STANDARD });
            await this.buyNowButtonLocator.first().click();
        } catch (error: any) {
            console.error(`❌ Failed to click BUY NOW button: ${error.message}`);
            throw new Error(`Failed to click BUY NOW button: ${error.message}`);
        }
    }

    /**
     * Continues to cart by clicking add to cart button
     */
    async continueToCart() {
        try {
            await expect(this.buyNowButtonLocator).toBeEnabled({ timeout: TIMEOUTS.STANDARD });
            await this.utils.scrollClick(this.buyNowButtonLocator);
            await this.addon.handleAddonPage();
        } catch (error: any) {
            console.error(`❌ Failed to add to cart with validation: ${error.message}`);
            throw new Error(`Add to cart with validation failed: ${error.message}`);
        }
    }

    /**
     * Selects specific product options on PD page
     * @param options - Options to select (color, storage, etc.)
     */
    async selectProductOptions(options: { color?: string; storage?: string }) {
        try {
            if (options.color) {
                const colorOption = this.page.locator(`[data-value="${options.color}"], [data-color="${options.color}"]`);
                await colorOption.click();
            }

            if (options.storage) {
                const storageOption = this.page.locator(`[data-value="${options.storage}"], [data-storage="${options.storage}"]`);
                await storageOption.click();
            }
        } catch (error: any) {
            console.error(`❌ Failed to select product options: ${error.message}`);
            throw new Error(`Failed to select product options: ${error.message}`);
        }
    }

    /**
     * Gets product price from PD page
     */
    async getProductPrice(): Promise<string> {
        try {
            const priceElement = this.page.locator('[data-testid="price"], .price, [class*="price"]').first();
            await priceElement.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            const price = await priceElement.textContent();
            return price || '';
        } catch (error: any) {
            console.error(`❌ Failed to get product price: ${error.message}`);
            return '';
        }
    }

    /**
     * Gets product name from PD page
     */
    async getProductName(): Promise<string> {
        try {
            const nameElement = this.page.locator('h1, [data-testid="product-title"], .product-title').first();
            await nameElement.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            const name = await nameElement.textContent();
            return name || '';
        } catch (error: any) {
            console.error(`❌ Failed to get product name: ${error.message}`);
            return '';
        }
    }

    /**
     * Checks if Trade-up option is selectable
     */
    async isTradeUpOptionSelectable(): Promise<boolean> {
        try {
            const tradeUpYesOption = this.page.locator('.pd-option-selector:has([an-la="trade-up:yes" i])');
            const isVisible = await tradeUpYesOption.isVisible().catch(() => false);
            return isVisible;
        } catch (error: any) {
            console.error(`❌ Failed to check Trade-up option: ${error.message}`);
            return false;
        }
    }

    /**
     * Adds Trade-up functionality with improved extensibility
     * Automatically handles site-specific requirements (postal code, selectors, etc.)
     */
    async addTradeUp(data: TradeUpSiteData): Promise<{ sku: string }> {
        try {
            console.log(`🔄 Adding Trade-up for site: ${this.tradeUpPopup['siteCode']}`);

            // Prepare trade-up data with postal code if needed
            const tradeUpData = {
                postalCode: data?.PostalCode || data?.postalCode,
                model: data?.model,
                brand: data?.brand
            };

            // Execute the complete trade-up flow using the new integrated method
            // Site-specific settings are automatically applied by TradeUpPopup
            await this.tradeUpPopup.executeTradeUpFlow(tradeUpData);

            // Get the current product SKU after trade-up is added
            const currentSku = await this.getSKU();
            console.log(`✅ Trade-up added successfully. Current SKU: ${currentSku}`);
            return { sku: currentSku };
        } catch (error: any) {
            console.error(`❌ Unable to add trade-up on PD page: ${error.message}`);
            throw new Error(`Unable to add trade-up on PD page: ${error.message}`);
        }
    }
}
