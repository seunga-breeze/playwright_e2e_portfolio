import { Page, Locator } from '@playwright/test';
import { DELAYS, TIMEOUTS } from './Utils';

export class Common {
  protected page: Page;
  readonly acceptAllBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.acceptAllBtn = page.locator('button#truste-consent-button, [an-la="cookie bar:accept"]');
  }

  async cookieAcceptAll() {
    try {
      await this.acceptAllBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
      await this.acceptAllBtn.click();
      console.log('✓ Accept All button clicked');
    } catch (error) {
      console.log('Accept All button not visible after 10 seconds, skipping click');
    }
  }
}