import { test, expect } from '../../fixtures';
import { Common } from '../../pages/Common';
import { Gnb } from '../../pages/Gnb';
import { SignUp } from '../../pages/SignUp';

/** [Test Scenario]
 * Sign up (Create account)
 * [Verify Point]
 * 1. Verify login status in the GNB on the Home page by checking the AfterLogin icon.
 */
test('Prod_Login_07', { tag: '@LOGIN' }, async ({ page, config, common, gnb, home, signUp }) => {
  console.log(`Starting Prod_Login_07 test | Site Code: ${config.siteCode}`);

  try {
    await page.goto('https://moakt.com/ko');
    const tempEmail = await signUp.createTempEmail(config.siteCode);

    // Open a second tab for the store — fixtures are single-page scoped,
    // so page objects for the new tab must be instantiated manually.
    const newTab = await page.context().newPage();
    const newTabCommon = new Common(newTab);
    const newTabGnb = new Gnb(newTab);
    const newTabSignUp = new SignUp(newTab);

    const homeUrl = home.getHomeUrl(config.baseUrl, config.siteCode);
    await newTab.goto(homeUrl);
    await newTabCommon.cookieAcceptAll();

    await newTabGnb.hoverBeforeLogin();
    await newTabGnb.clickSignInSignUp();

    await newTabSignUp.clickCreateAccount();
    await newTabSignUp.termsCheckbox.check();
    await newTabSignUp.agreeButton.click();
    await newTabSignUp.fillSignUpForm(tempEmail, config.LOGIN_PW!);
    await newTabSignUp.submitSignUpForm();

    await page.bringToFront();
    const otpCode = await signUp.getOTPFromEmail();

    await newTab.bringToFront();
    await newTabSignUp.confirmOTP(otpCode);
    await newTabSignUp.clickSignUpComplete();

    await newTabGnb.verifyLoginSuccess();

    console.log(`🎉 Prod_Login_07_(${config.siteCode}) test completed successfully!`);

  } catch (error: any) {
    console.error(`❌ Prod_Login_07 test failed: ${error.message}`);
    throw error;
  }
});
