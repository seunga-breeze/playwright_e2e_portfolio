import { Page, Locator } from '@playwright/test';
import { DELAYS, TIMEOUTS } from './Utils';

export class SignUp {
    readonly page: Page;
    
    // Sign up button locator
    readonly createAccountBtn: Locator;

    // Sign up form locators
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly confirmPasswordInput: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly dayInput: Locator;
    readonly monthSelect: Locator;
    readonly yearInput: Locator;
    readonly termsCheckbox: Locator;
    readonly agreeButton: Locator;
    readonly submitButton: Locator;

    // OTP related locators
    readonly otpInput: Locator;
    readonly otpSubmitButton: Locator;
    readonly signUpCompleteButton: Locator;

    // moakt temporary email locators
    readonly moaktEmailInput: Locator;
    readonly moaktCreateButton: Locator;
    readonly moaktRefreshButton: Locator;
    readonly moaktEmailTitle: Locator;
    readonly moaktFrame: Locator;
    readonly moaktOTPArea: Locator;

    constructor(page: Page) {
        this.page = page;

        this.createAccountBtn = page.locator('.MuiBox-root:has(> div > form) > div:nth-child(5) a, a[data-ng-click="signUp()"]');

        this.emailInput = page.locator('input[name="account"],input[name="signUpID"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
        this.firstNameInput = page.locator('input[name="firstName"],input[name="givenName1"],input[name="givenName"]');
        this.lastNameInput = page.locator('input[name="lastName"],input[name="familyName1"],input[name="familyName"]');
        this.dayInput = page.locator('input[name="day"]');
        this.monthSelect = page.locator('select#month,select[name="month"]');
        this.yearInput = page.locator('input[name="year"]');
        this.termsCheckbox = page.locator('input#all[type="checkbox"],input#iptTncAll[type="checkbox"]');
        this.agreeButton = page.locator('button[type="button"][data-log-id="agree"]');
        this.submitButton = page.locator('button[type="submit"],.under-content button#submitForCaptcha').first();

        this.otpInput = page.locator('[data-testid="otp"], input[name="otp"], #otp');
        this.otpSubmitButton = page.locator('button[data-testid="submitOTP"], button[type="submit"]').first();
        this.signUpCompleteButton = page.locator('#btnSignUpComplete, button.MuiButton-containedPrimary');

        // moakt related locators
        this.moaktEmailInput = page.locator('input.mail_in');
        this.moaktCreateButton = page.locator('input.mail_butt');
        this.moaktRefreshButton = page.locator("i.material-icons.button-blue");
        this.moaktEmailTitle = page.locator('td:not(.no-mobile) a[href*="/ok/email/"], td:not(.no-mobile) a[href*="/en/email/"]');
        this.moaktFrame = page.locator('iframe[src^="/ok/email/"], iframe[src^="/en/email/"]');
        this.moaktOTPArea = page.locator('p[style*="text-align: center"][style*="font-size: 30px"]');
    }

    // @param siteCode Site code (UK, US, etc.)
    // @returns Generated temporary email address
    async createTempEmail(siteCode: string): Promise<string> {
        try {
            // Prepare email address (timestamp-based)
            const now = new Date();
            const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
            const emailPrefix = `wwauto_${siteCode.toLowerCase()}_${timestamp}`;

            await this.moaktEmailInput.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await this.moaktEmailInput.fill(emailPrefix);
            await this.moaktCreateButton.click();
            await this.page.waitForTimeout(DELAYS.STANDARD);

            const fullEmail = `${emailPrefix}@teml.net`;
            return fullEmail;
            
        } catch (error: any) {
            console.error(`❌ Failed to create temporary email: ${error.message}`);
            throw new Error(`Temporary email creation failed: ${error.message}`);
        }
    }

    async getOTPFromEmail(): Promise<string> {
        try {
            await this.page.waitForLoadState('domcontentloaded');
            await this.page.waitForTimeout(DELAYS.LONG); // Wait for email delivery

            await this.moaktRefreshButton.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await this.moaktRefreshButton.click();

            await this.moaktEmailTitle.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await this.moaktEmailTitle.click();

            await this.moaktFrame.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            const frame = await this.moaktFrame.contentFrame();

            if (!frame) {
                throw new Error('Frame not found');
            }

            const otpElement = frame.locator('p[style*="text-align: center"][style*="font-size: 30px"]');
            await otpElement.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            const otpCode = await otpElement.textContent();

            if (!otpCode?.trim()) {
                throw new Error('OTP code not found or empty');
            }

            return otpCode.trim();
            
        } catch (error: any) {
            console.error(`❌ Failed to get OTP code: ${error.message}`);
            throw new Error(`OTP retrieval failed: ${error.message}`);
        }
    }

    async clickCreateAccount() {
        try {
          await this.createAccountBtn.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
          await this.createAccountBtn.scrollIntoViewIfNeeded();
          await this.page.waitForTimeout(DELAYS.SHORT);
          await this.createAccountBtn.click();
        } catch (error: any) {
          console.error('❌ Failed to click Create Account button:', error.message);
          throw new Error(`Create Account click failed: ${error.message}`);
        }
      }

    async fillSignUpForm(email: string, password: string) {
        try {
            await this.emailInput.fill(email);
            await this.emailInput.blur();
            await this.page.waitForTimeout(DELAYS.SHORT);
            await this.passwordInput.fill(password);
            await this.confirmPasswordInput.fill(password);
            await this.firstNameInput.fill('firstname');
            await this.lastNameInput.fill('lastname');
            await this.dayInput.fill('1');
            await this.monthSelect.selectOption({ index: 1 });
            await this.yearInput.fill('1990');
        } catch (error: any) {
            console.error(`❌ Failed to fill sign-up form: ${error.message}`);
            throw new Error(`Sign-up form filling failed: ${error.message}`);
        }
    }

    async submitSignUpForm() {
        try {
            await this.submitButton.click();
        } catch (error: any) {
            console.error(`❌ Failed to submit sign-up form: ${error.message}`);
            throw new Error(`Sign-up form submission failed: ${error.message}`);
        }
    }
    
    async confirmOTP(otpCode: string) {
        try {
            await this.otpInput.fill(otpCode);
            await this.otpSubmitButton.click();

            // Wait for navigation to sign-up complete page
            await this.page.waitForURL(/.*\/(signUpComplete|complete).*/, { timeout: 10000 });
            await this.page.waitForLoadState('domcontentloaded');
            await this.page.waitForTimeout(DELAYS.STANDARD);
        } catch (error: any) {
            console.error(`❌ Failed to confirm OTP: ${error.message}`);
            throw new Error(`OTP confirmation failed: ${error.message}`);
        }
    }

    async clickSignUpComplete() {
        try {
            await this.signUpCompleteButton.click();

            // Wait until leaving account.demostore.example.com
            await this.page.waitForFunction(
                () => !window.location.href.startsWith('https://account.demostore.example.com/'),
                {},
                { timeout: 10000 }
            );
            await this.page.waitForLoadState('domcontentloaded');
        } catch (error: any) {
            console.error(`❌ Failed to complete sign-up: ${error.message}`);
            throw new Error(`Sign-up completion failed: ${error.message}`);
        }
    }
 }
