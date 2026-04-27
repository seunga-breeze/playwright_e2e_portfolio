import { test, expect } from '../../fixtures';

test('Prod_PF_01', { tag: '@PF' }, async ({ page, common, gnb, pf, bc, pd, cart, home, config }) => {
  console.log('🚀 Starting Prod_PF_01 test...');

  try {
    const homeUrl = home.getHomeUrl(config.baseUrl, config.siteCode);
    await page.goto(homeUrl);
    await common.cookieAcceptAll();

    const category = await gnb.getValidCategory('mobile');
    await gnb.hoverGnbCategory(category);

    const pfSku = await pf.clickAvailableBuyNow(category);
    if (!pfSku) {
      throw new Error('No purchasable product found in PF');
    }

    const visiblePage = await Promise.race([
      bc.isBCVisible().then(visible => ({ type: 'BC', visible })),
      pd.isPdVisible().then(visible => ({ type: 'PD', visible }))
    ]);

    const isBC = visiblePage.type === 'BC' && visiblePage.visible;
    const isPD = visiblePage.type === 'PD' && visiblePage.visible;

    let finalSku = pfSku;

    if (isBC) {
      const bcSku = await bc.getSelectedSKU();
      expect(pfSku).toContain(bcSku);

      const screenshot = await bc.highlightSkuAndCapture();
      await test.info().attach('BC SKU Verification Success', {
        body: screenshot,
        contentType: 'image/png'
      });

      await bc.continueToCart();

    } else if (isPD) {
      const pdSku = await pd.getSKU();
      expect(pfSku).toContain(pdSku);

      const screenshot = await pd.highlightSkuAndCapture();
      await test.info().attach('PD SKU Verification Success', {
        body: screenshot,
        contentType: 'image/png'
      });

      finalSku = pdSku;
      await pd.continueToCart();

    } else {
      await cart.expectCartPageIsOpen();
    }

    await cart.verifyCartSKU(finalSku);

    console.log('🎉 Prod_PF_01 test completed successfully!');

  } catch (error: any) {
    console.error(`❌ Prod_PF_01 test failed: ${error.message}`);
    throw error;
  }
});
