import { test, expect } from '../../fixtures';

test('Prod_BC_01', { tag: ['@BC', '@TABLET'] }, async ({ page, config, bc, cart, common, home, gnb }) => {
  console.log('🚀 Starting Prod_BC_01 test...');

  try {
    const { device, color, storage, sku } = config.BC_Tablet!;

    const homeUrl = home.getHomeUrl(config.baseUrl, config.siteCode);
    await page.goto(homeUrl);
    await common.cookieAcceptAll();

    await bc.retryNavigation(gnb, "Shop", device);
    await bc.selectDeviceOptions(device, color, storage);

    const selectedSKU = await bc.getSelectedSKU();
    await bc.expectSKUSelected(sku, selectedSKU);

    // Add trade-in and protection plan conditionally
    let tradeInAdded = false;
    let scpAdded = false;

    if (await bc.isTradeInAvailable()) {
      await bc.addTradeIn(device);
      await bc.verifyTradeInAdded();
      tradeInAdded = true;
    }

    if (await bc.isProtectionPlanAvailable()) {
      await bc.selectNoLoyaltyProgram();
      await bc.addProtectionPlan();
      scpAdded = true;
    }

    expect(tradeInAdded || scpAdded).toBeTruthy();

    await bc.verifyPrice('device', device);
    await bc.verifyPrice('storage', storage);
    await bc.verifySummaryAndCalculatorPrice();

    await bc.continueToCart();

    await cart.verifyCartSKU(selectedSKU);

    if (tradeInAdded) {
      await cart.verifyTradeInAdded(1);
    }

    if (scpAdded) {
      await cart.verifySCPInCart(1);
    }

    console.log('🎉 Prod_BC_01 test completed successfully!');

  } catch (error: any) {
    console.error(`❌ Prod_BC_01 test failed: ${error.message}`);
    throw error;
  }
});
