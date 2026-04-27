import { test as base, TestInfo } from '@playwright/test';
import { Home } from './pages/Home';
import { BC } from './pages/BC';
import { PD } from './pages/PD';
import { AddonPage } from './pages/Addon';
import { Cart } from './pages/Cart';
import { Gnb } from './pages/Gnb';
import { Common } from './pages/Common';
import { Checkout } from './pages/Checkout/Checkout';
import { Utils } from './pages/Utils';
import { PF } from './pages/PF';
import { SignUp } from './pages/SignUp';
import { ProjectConfig, TradeInDevice, TradeInDeviceGroup } from './types/config';

type TestFixtures = {
  config: ProjectConfig;
  home: Home;
  bc: BC;
  pd: PD;
  pf: PF;
  addon: AddonPage;
  cart: Cart;
  gnb: Gnb;
  common: Common;
  checkout: Checkout;
  utils: Utils;
  signUp: SignUp;
  tradeInData: TradeInDeviceGroup;
};

export const test = base.extend<TestFixtures>({
  config: async ({ }, use: (config: ProjectConfig) => Promise<void>, testInfo: TestInfo) => {
    const config = testInfo.project.metadata as ProjectConfig;

    const naTests = config.naTests || [];
    if (naTests.includes(testInfo.title)) {
      test.skip(true, 'NA processing');
      return;
    }

    await use(config);
  },

  home: async ({ page }, use) => {
    await use(new Home(page));
  },

  bc: async ({ page, tradeInData, config }, use) => {
    await use(new BC(page, tradeInData, config));
  },

  pd: async ({ page, config }, use) => {
    await use(new PD(page, config));
  },

  pf: async ({ page, gnb }, use) => {
    await use(new PF(page, gnb));
  },

  addon: async ({ page }, use) => {
    await use(new AddonPage(page));
  },

  cart: async ({ page, tradeInData, config }, use) => {
    await use(new Cart(page, tradeInData, config));
  },

  gnb: async ({ page }, use) => {
    await use(new Gnb(page));
  },

  common: async ({ page }, use) => {
    await use(new Common(page));
  },

  checkout: async ({ page }, use) => {
    await use(new Checkout(page));
  },

  utils: async ({ page }, use) => {
    await use(new Utils(page));
  },

  signUp: async ({ page }, use) => {
    await use(new SignUp(page));
  },

  tradeInData: async ({ config }, use) => {
    const devices: TradeInDevice[] = config.tradeInDevices || [];
    await use({
      siteCode: config.siteCode,
      devices,
      phone:  devices.find(d => d.type === 'phone'),
      watch:  devices.find(d => d.type === 'watch'),
      tablet: devices.find(d => d.type === 'tablet'),
    });
  },
});


export { expect } from '@playwright/test';
