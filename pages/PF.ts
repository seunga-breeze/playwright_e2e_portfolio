import { Page, Locator, expect } from '@playwright/test';
import { Gnb } from './Gnb';

export class PF {
  readonly page: Page;
  readonly areaPf: Locator;
  private buyButtonLocator: Locator;
  private gnb?: Gnb;

  constructor(page: Page, gnb?: Gnb) {
    this.page = page;
    this.areaPf = page.locator('.pd-g-product-finder-ux2');
    this.buyButtonLocator = page.locator('button[an-ac="addToCart"], button[an-ac="buy now"]');
    this.gnb = gnb;
  }

  async isPfVisible(options?: { timeout?: number; log?: boolean }): Promise<boolean> {
    try {
      await this.areaPf.waitFor({
        state: 'visible',
        timeout: options?.timeout ?? 3000
      });
      if (options?.log) console.log('PF area is visible');
      return true;
    } catch (error) {
      if (options?.log) console.log('PF area not visible:', error);
      return false;
    }
  }

  async getValidBuyButtons(): Promise<Array<{ button: Locator; sku: string | null }>> {
    try {
      const buttons = await this.buyButtonLocator.all();
      console.log(`Found ${buttons.length} buy buttons on page`);
      
      const validButtonsData = await Promise.all(
        buttons.map(async (button) => {
          const [isVisible, sku] = await Promise.all([
            button.isVisible({ timeout: 5000 }),
            button.getAttribute('data-modelcode')
          ]);
          
          const isValid = isVisible && (!sku || !sku.startsWith('F-'));
          if (!isValid) {
            console.log(`Invalid button - Visible: ${isVisible}, SKU: ${sku || 'No SKU'}`);
          }
          return { button, sku, isValid };
        })
      );
      
      const validButtons = validButtonsData
        .filter(data => data.isValid)
        .map(data => ({ button: data.button, sku: data.sku }));
      
      console.log(`Found ${validButtons.length} valid buy buttons`);
      return validButtons;
        
    } catch (error) {
      console.log('Error getting buy buttons:', error);
      return [];
    }
  }

  async checkBuyNowButtonAvailable(): Promise<boolean> {
    const validButtons = await this.getValidBuyButtons();
    const isAvailable = validButtons.length > 0;
    console.log(`Buy now button available: ${isAvailable ? 'Yes' : 'No'}`);
    return isAvailable;
  }

  private getRandomItem<T>(array: T[]): T {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled[0];
  }

  async clickRandomBuyButton(validButtons: Array<{ button: Locator; sku: string | null }>): Promise<void> {
    try {
      const selectedButtonData = this.getRandomItem(validButtons);
      console.log(`Selected button with SKU: ${selectedButtonData.sku || 'No SKU'}`);
      await selectedButtonData.button.click();
      console.log('Successfully clicked buy button');
    } catch (error) {
      console.log('Failed to click buy button:', error);
      throw error;
    }
  } 
  
  async clickAvailableBuyNow(category: string): Promise<string | null> {
    if (!this.gnb) {
      throw new Error('GNB instance is required. Please provide it in constructor.');
    }
    
    try {
      const availableCatalogs = await this.gnb.getvalidCatalogs(category);
      console.log(`Available catalogs: ${availableCatalogs.join(', ')}`);

      const catalogsToTry = Math.min(availableCatalogs.length, 10);
      
      for (let attempt = 0; attempt < catalogsToTry; attempt++) {
        const selectedCatalog = this.gnb!.getRandomItem(availableCatalogs);
        console.log(`Attempt ${attempt + 1}: ${selectedCatalog}`);
        
        
        // Try to make PF visible: first clickGnbCatalog only, then hover+click set
        try {
          await expect(async () => {
            // First attempt: clickGnbCatalog only
            await this.gnb!.clickGnbCatalog(category, selectedCatalog);
            if (await this.isPfVisible({ timeout: 5000 })) return;
            
            // If PF not visible, try hover + click set
            await this.gnb!.hoverGnbCategory(category);
            await this.gnb!.clickGnbCatalog(category, selectedCatalog);
            expect(await this.isPfVisible({ timeout: 5000 })).toBe(true);
          }).toPass({ timeout: 20000, intervals: [1000, 2000, 3000] });
        } catch (error) {
          console.log(`PF area not visible for catalog: ${selectedCatalog}`);
          continue;
        }
        
        await this.gnb!.clickRandomSecondaryNavi();
        await this.page.waitForTimeout(1500);
        
        const validButtons = await this.getValidBuyButtons();
        if (validButtons.length) {
          const selectedButtonData = this.getRandomItem(validButtons);
          console.log(`Selected button with SKU: ${selectedButtonData.sku || 'No SKU'}`);
          
          await selectedButtonData.button.click();
          console.log('click PF buy now button successful!');
          
          return selectedButtonData.sku || 'unknown';
        } else {
          console.log(`No valid buy buttons found for catalog: ${selectedCatalog}`);
        }
        
        if (attempt < catalogsToTry - 1) {
          await this.gnb!.hoverGnbCategory(category);
        }
      }
      
      console.log(`No purchasable product found after trying ${catalogsToTry} catalogs`);
      return null;
      
    } catch (error) {
      console.error('Error finding buyable product:', error);
      return null;
    }
  }
}