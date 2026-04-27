import { Page, Locator, expect } from '@playwright/test';
import { DELAYS, TIMEOUTS } from './Utils';
import { Cart } from './Cart';

export class Gnb {
  readonly page: Page;
  readonly beforeLogin: Locator;
  readonly shopBeforeLogin: Locator;
  readonly signInSignUpBtn: Locator;
  readonly shopSignInSignUpBtn: Locator;
  readonly afterLogin: Locator;
  readonly userIcon: Locator;
  readonly btnCart: Locator;
  readonly logoutBtn: Locator;
  readonly shopLogoutBtn: Locator;
  private cart: Cart;
  
  private static readonly gnbSelectors = {
    category: (v: string) => `.nv00-gnb-v4__l0-menu-link[an-la="${v}"i]`,
    catalog: (type: string, v: string) => `.nv00-gnb-v4__l1-menu-link[an-la^="${type}:"i][an-la*="${v}"i]`,
    shopCategory: (v: string) => `a.main-nav-link[data-an-la="${v}"i]`,
    shopCatalog: (type: string, v: string) => `.nav-level2-column-wrapper a[data-an-la="${type}: "i][href*="${v}"i], .nav-level2-column-wrapper a[data-an-la*="${v}"i]`
  };

  constructor(page: Page) {
    this.page = page;
    this.beforeLogin = page.locator('div.nv00-gnb-v4__utility-wrap.before-login > button');
    this.shopBeforeLogin = page.locator('.mat-mdc-menu-trigger.nav-action-button[data-an-la="login"]');
    this.signInSignUpBtn = page.locator('a.nv00-gnb-v4__utility-menu--sign-in.loginBtn');
    this.shopSignInSignUpBtn = page.locator('.sso-url.login-signup[data-an-la=login][id="profile-menu-item-first"]');
    this.afterLogin = page.locator('div.nv00-gnb-v4__utility-wrap.after-login');
    this.userIcon = page.locator('button.nv00-gnb-v4__utility-menu--user, .user-icon, [data-an-la="gnb:user"]');
    this.btnCart = page.locator('.nv00-gnb-v4__utility-list .nv00-gnb-v4__utility-cart');
    this.logoutBtn = page.locator('[an-la="logout"], a[data-an-la="logout"]:not([role="menuitem"]), a[aria-label="logout"]');
    this.shopLogoutBtn = page.locator('a[data-an-la="logout"]:not([role="menuitem"])');
    this.cart = new Cart(page);
  }

  private getCategoryLocator(v: string): Locator {
    return this.page.locator(Gnb.gnbSelectors.category(v));
  } 

  private getCatalogProductLocator(type: string, v: string): Locator {
    return this.page.locator(Gnb.gnbSelectors.catalog(type, v));
  }

  private getShopCategoryLocator(v: string): Locator {
    return this.page.locator(Gnb.gnbSelectors.shopCategory(v));
  }

  private getShopCatalogLocator(type: string, v: string): Locator {
    return this.page.locator(Gnb.gnbSelectors.shopCatalog(type, v));
  }

  async hoverBeforeLogin() {
    try {
      console.log('Attempting to hover over before login menu...');
      await this.beforeLogin.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      await this.beforeLogin.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(DELAYS.SHORT);
      await this.beforeLogin.hover();
      console.log('✓ Before login menu hovered successfully');
    } catch (error: any) {
      console.error('Failed to hover before login menu:', error.message);
      throw new Error(`Before login hover failed: ${error.message}`);
    }
  }

  async hoverShopBeforeLogin() {
    try {
      console.log('Attempting to hover over shop before login menu...');
      await this.shopBeforeLogin.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      await this.shopBeforeLogin.scrollIntoViewIfNeeded();
      await this.shopBeforeLogin.hover();
      console.log('✓ Shop before login menu hovered successfully');
    } catch (error: any) {
      console.error('Failed to hover Shop before login menu for Shop:', error.message);
      throw new Error(`Shop Before login hover failed: ${error.message}`);
    }
  }

  async hoverAfterLogin() {
    try {
      console.log('Attempting to hover over after login menu...');
      await this.afterLogin.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      await this.afterLogin.hover();
      console.log('✓ After login menu hovered successfully');
    } catch (error: any) {
      console.error('Failed to hover after login menu:', error.message);
      throw new Error(`After login hover failed: ${error.message}`);
    }
  }

  async hoverShopAfterLogin() {
    try {
      console.log('Attempting to hover over shop after login menu...');
      await this.shopBeforeLogin.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      await this.shopBeforeLogin.scrollIntoViewIfNeeded();
      await this.shopBeforeLogin.hover();
      console.log('✓ Shop after login menu hovered successfully');
    } catch (error: any) {
      console.error('Failed to hover Shop after login menu for Shop:', error.message);
      throw new Error(`Shop After login hover failed: ${error.message}`);
    }
  }

  async clickSignInSignUp() {
    try {
      console.log('Attempting to click Sign In/Sign Up button...');
      await this.signInSignUpBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      await this.signInSignUpBtn.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(DELAYS.SHORT);
      await this.signInSignUpBtn.click();
      console.log('✓ Sign In/Sign Up button clicked successfully');
    } catch (error: any) {
      console.error('Failed to click Sign In/Sign Up button:', error.message);
      throw new Error(`Sign In/Sign Up click failed: ${error.message}`);
    }
  }

   async clickShopSignInSignUp() {
    try {
      console.log('Attempting to click Shop Sign In/Sign Up button...');
      await this.shopSignInSignUpBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      await this.shopSignInSignUpBtn.scrollIntoViewIfNeeded();
      await this.shopSignInSignUpBtn.click();
      console.log('✓ Shop Sign In/Sign Up button clicked successfully');
    } catch (error: any) {
      console.error('Failed to click Shop Sign In/Sign Up button:', error.message);
      throw new Error(`Shop Sign In/Sign Up click failed: ${error.message}`);
    }
  }

    async clickLogout() {
      try {
        console.log('Attempting to click Logout button...');
        await this.logoutBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
        await this.logoutBtn.click();
        console.log('✓ Logout button clicked successfully');
      } catch (error: any) {
        console.error('Failed to click Logout button:', error.message);
        throw new Error(`Logout click failed: ${error.message}`);
      }
    }

  async verifyLoginSuccess() {
    try {
      await this.afterLogin.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      console.log('✓ Login verification successful - user icon visible');
    } catch (error: any) {
      console.error('Login verification failed - user icon not visible');
      throw new Error(`Login verification failed: ${error.message}`);
    }
  }

    async verifyShopLoginSuccess() {
      try {
        await this.shopBeforeLogin.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
        await this.shopBeforeLogin.hover();
        await this.shopLogoutBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
        console.log('✓ Shop Login verification successful - logout button visible');
      } catch (error: any) {
        console.error('Shop Login verification failed - logout button not visible');
        throw new Error(`Shop Login verification failed: ${error.message}`);
      }
    }
  

  async verifyLogoutSuccess() {
    try {
      await this.beforeLogin.hover();
      await this.signInSignUpBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      console.log('✓ Logout verification successful - Sign In link visible');
    } catch (error: any) {
      console.error('Logout verification failed - sign in link not visible');
      throw new Error(`Logout verification failed: ${error.message}`);
    }
  }

  async hoverGnbCategory(text: string) {
    try {
      console.log(`Attempting to hover over GNB category with text: ${text}...`);
      
      // Create locator dynamically
      const categoryLocator = this.getCategoryLocator(text);
      
      await categoryLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      // await this.page.waitForTimeout(DELAYS.SHORT);
      await categoryLocator.hover();
      console.log(`✓ GNB category with text "${text}" hovered successfully`);
    } catch (error: any) {
      console.error(`Failed to hover GNB category with text "${text}":`, error.message);
      throw new Error(`GNB category hover failed for text "${text}": ${error.message}`);
    }
  }

  async clickGnbCatalog(type: string, text: string) {
    try {
      console.log(`Attempting to click GNB ${type} catalog product with text: ${text}...`);
      
      // Create locator dynamically
      const productLocator = this.getCatalogProductLocator(type, text);
      
      // Wait for product to appear
      await productLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      await productLocator.click();
      console.log(`✓ GNB ${type} catalog product with text "${text}" clicked successfully`);
           
    } catch (error: any) {
      console.error(`Failed to click GNB ${type} catalog product with text "${text}":`, error.message);
      throw new Error(`GNB ${type} catalog product click failed for text "${text}": ${error.message}`);
    }
  }

  public async clickCart(): Promise<void> {
    try {
      console.log('Attempting to click GNB cart button...');
      
      // Priority: 2nd button → last → first active
      const count = await this.btnCart.count();
      if (count >= 2) {
        const secondBtn = this.btnCart.nth(1);
        await secondBtn.waitFor({ state: 'visible', timeout: 10000 });
        if (await secondBtn.isEnabled()) {
          await secondBtn.click();
        } else {
          // Fall back to last button if 2nd is disabled
          const lastBtn = this.btnCart.last();
          await lastBtn.waitFor({ state: 'visible', timeout: 10000 });
          await lastBtn.click();
        }
      } else {
        // Only 1 button: find first active
        let clicked = false;
        const candidates = await this.btnCart.all();
        for (const btn of candidates) {
          if (await btn.isVisible() && await btn.isEnabled()) {
            await btn.click();
            clicked = true;
            break;
          }
        }
        if (!clicked) {
          throw new Error('No visible/enabled cart button found');
        }
      }
      console.log('✓ GNB cart button clicked successfully');
      
      await this.cart.expectCartPageIsOpen();
      console.log('✓ Waited for cart page to load after click');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to click GNB cart button:', errorMessage);
      throw new Error(`GNB cart button click failed: ${errorMessage}`);
    }
  }

  public async hoverShopCategory(text: string): Promise<void> {
    try {
      console.log(`Attempting to hover shop category with text: ${text}...`);
      
      // Create locator dynamically
      const categoryLocator = this.getShopCategoryLocator(text);
      
      await categoryLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      await categoryLocator.hover();
      console.log(`✓ Shop category with text "${text}" hovered successfully`);
 
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Failed to hover shop category with text "${text}":`, errorMessage);
      throw new Error(`Shop category hover failed for text "${text}": ${errorMessage}`);
    }
  }

  public async clickShopCatalog(type: string, text: string): Promise<void> {
    try {
      console.log(`Attempting to click shop ${type} catalog product with text: ${text}...`);
      // Create locator dynamically
      const catalogLocator = this.getShopCatalogLocator(type, text);
      
      await catalogLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.LONG });
      await catalogLocator.click();
      console.log(`✓ Shop ${type} catalog product with text "${text}" clicked successfully`);
      
 
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`Failed to click shop ${type} catalog product with text "${text}":`, errorMessage);
      throw new Error(`Shop ${type} catalog product click failed for text "${text}": ${errorMessage}`);
    }
  }

  async getvalidCatalogs(category: string): Promise<string[]> {
    // Define exclude list
    const excludeListMap: { [key: string]: string[] } = {
      'mobile': ['accessories', 'ring', 'apps and services'],
      'appliances': ['accessories'],
      'tv and av': ['accessories'],
      'computing and displays': ['accessories', 'book', 'laptop'],
      'it': ['accessories', ' book', 'laptop'],
      'monitors': ['accessories', 'book', 'laptop'],
      'displays': ['accessories', 'book', 'laptop'],
      'home appliances': ['accessories']
    };

    try {
      // Find L1 menus for the category
      const locators = await this.page.locator(`a.nv00-gnb-v4__l1-menu-link[an-la^="${category}"]`).all();
      const excludeList = excludeListMap[category] || [];
      
      const catalogNames = await Promise.all(
        locators.map(async locator => {
          const anLa = await locator.getAttribute('an-la');
          if (!anLa) return null;
          
          const engName = anLa.toLowerCase().trim();
          
          // Check exclude list first to prevent unnecessary split operations
          if (excludeList.some(item => engName.includes(item))) {
            return null;
          }
          
          const catalogName = anLa.split(':').pop()?.trim();
          return catalogName || null;
        })
      );

      // Type-safe filtering
      const validCatalogs = catalogNames.filter((name): name is string => name !== null);

      if (validCatalogs.length === 0) {
        throw new Error(`No valid L1 catalogs found for: ${category}`);
      }

      console.log(`Found ${validCatalogs.length} valid L1 catalogs: [${validCatalogs.join(', ')}]`);
      return validCatalogs;
      
    } catch (error) {
      // Special handling for Playwright TimeoutError
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new Error(`Timeout finding L1 catalogs for: ${category}`);
      }
      throw error;
    }
  }


  async getValidCategory(...categories: string[]): Promise<string> {
    console.log(`Trying L1 categories in parallel: ${categories.join(', ')}`);
    
    const categoryPromises = categories.map(async (category) => {
      try {
        const locator = this.page.locator(`a.nv00-gnb-v4__l1-menu-link[an-la^="${category}"]`).first();
        await locator.waitFor({ state: 'attached', timeout: 15000 });
        return { category, success: true };
      } catch (error) {
        return { category, success: false };
      }
    });

    // Wait for the first successful category
    const results = await Promise.allSettled(categoryPromises);
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        console.log(`L1 found: '${result.value.category}'`);
        return result.value.category;
      }
    }

    throw new Error(`No valid L1 found among categories: ${JSON.stringify(categories)}`);
  }

  getRandomItem<T>(array: T[]): T {
      if (array.length === 0) {
        throw new Error('Cannot select from empty array');
      }
      
      // Ensure perfect randomness with Fisher-Yates shuffle algorithm
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      return shuffled[0];
    }

  async clickRandomSecondaryNavi(): Promise<void> {
    try {
      console.log('Finding secondary navi elements...');
      const validElements = await this.findValidSecondaryNaviElements();
      
      if (validElements.length === 0) {
        console.log('No valid secondary navi elements found');
        return;
      }

      console.log(`Found ${validElements.length} valid secondary navi elements`);
      const selectedElement = this.getRandomItem(validElements);
      
      console.log(`Clicking selected secondary navi...`);
      await selectedElement.click();
      console.log(`Secondary navi clicked successfully`);
      
    } catch (error) {
      console.error('Failed to click random secondary navi:', error);
      throw error;
    }
  }

  private async findValidSecondaryNaviElements(): Promise<Locator[]> {
    // Find all elements containing secondary navi
    const allLocators = await this.page.locator('[an-la*="secondary navi"],[an-la*="sub navi"]').all();
    
    if (allLocators.length === 0) {
      return [];
    }

    // Exclude text list (O(1) search with Set)
    const excludeSet = new Set(['compare', 'accessories']);
    
    // Process all tasks with single Promise.all: visibility + filtering
    const processedLocators = await Promise.all(
      allLocators.map(async (locator) => {
        // 1. Check visibility
        const isVisible = await locator.isVisible();
        if (!isVisible) return null;
        
        // 2. Check exclude list (for filtering only)
        const anLa = (await locator.getAttribute('an-la') || '').toLowerCase();
        const text = (await locator.textContent() || '').toLowerCase();
        const shouldExclude = [...excludeSet].some(exclude => 
          anLa.includes(exclude) || text.includes(exclude)
        );
        
        return shouldExclude ? null : locator;
      })
    );
    
    return processedLocators.filter(Boolean) as Locator[];
  }

}