import { test, expect } from '../../fixtures';
import { prod_Checkout_01_UK } from '../../pages/Checkout/RegionB/UK/commonCheckoutSteps_UK';
import { prod_Checkout_01_AU } from '../../pages/Checkout/RegionA/AU/commonCheckoutSteps_AU';

test('Prod_Checkout_01', { tag: '@CHECKOUT' }, async ({ page, config, pd, addon, cart, common, checkout, utils }) => {
  console.log('🚀 Starting Prod_Checkout_01 test...');

  try {
    await page.goto(config.PD_IM1!.Url);
    await page.waitForLoadState('domcontentloaded');
    await common.cookieAcceptAll();

    await pd.continueToCart();
    await cart.expectCartPageIsOpen();
    await checkout.goToCheckoutPage(cart, config, utils);

    switch (config.siteCode.toUpperCase()) {
      case 'UK':
        await prod_Checkout_01_UK(checkout, config, cart, utils);
        break;
      case 'AU':
        await prod_Checkout_01_AU(checkout, config, cart, utils);
        break;
      default:
        throw new Error(`Unsupported site code: ${config.siteCode}`);
    }

    console.log('🎉 Prod_Checkout_01 test completed successfully!');

  } catch (error: any) {
    console.error(`❌ Prod_Checkout_01 test failed: ${error.message}`);
    throw error;
  }
});
