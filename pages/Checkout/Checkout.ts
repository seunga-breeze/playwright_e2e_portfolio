import { Page, Locator, expect } from '@playwright/test';
import { Utils } from '../Utils';
import { TIMEOUTS } from '../Utils';
import { Cart } from '../Cart';

export class Checkout {
    private page: Page;
    private utils: Utils;
    private checkoutPageLocator: Locator;
    private guestCheckoutPageLocator: Locator;
    private sameAsShippingCheckboxLocator: Locator;
    private matOptionLocator: Locator;
    private continueToNextStepButtonLocator: Locator;
    private customerAddressFormLocator: Locator;
    private customerAddressSaveCheckboxLocator: Locator;
    private billingAddressSaveCheckboxLocator: Locator;
    private continueToPaymentButtonLocator: Locator;
    private paymentModesAreaLocator: Locator;

    constructor(page: Page) {
        this.page = page;
        this.utils = new Utils(page);
        this.checkoutPageLocator = page.locator('cx-storefront.v2.stop-navigating.CheckoutPageTemplateV2');
        this.guestCheckoutPageLocator = page.locator('cx-page-layout.CheckoutLoginPageTemplate');
        this.sameAsShippingCheckboxLocator = page.locator('input[name="sameAsShipping"]');
        this.matOptionLocator = page.locator('mat-option');
        this.continueToNextStepButtonLocator = page.locator('button[data-an-la="customer details:Continue to delivery options"]');
        this.customerAddressFormLocator = page.locator('app-customer-address-v2 form, app-customer-address-cn');
        this.customerAddressSaveCheckboxLocator = page.locator('app-customer-address-v2 mat-checkbox:has(input[name="saveInAddressBook"]), app-customer-address-cn mat-checkbox:has(input[name="saveInAddressBook"])');
        this.billingAddressSaveCheckboxLocator = page.locator('app-billing-address-v2 mat-checkbox:has(input[name="saveInAddressBook"])');
        this.continueToPaymentButtonLocator = page.locator('[data-an-la="delivery option:next"], [data-an-la="order detail2:next"], .customer-details--continue-btn, button#checkout-page-order-btn');
        this.paymentModesAreaLocator = page.locator('app-payment-modes .payment-modes, .payment-modes-container.ng-star-inserted, app-payment-modes-flat .payment-modes-container');
    }

    /**
     * Verifies that the guest checkout page has loaded successfully
     * Checks if CheckoutLoginPageTemplate layout is visible
     */
    async verifySplashPage() {
        try {
            await this.guestCheckoutPageLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
        } catch (error: any) {
            console.error(`❌ Guest checkout page verification failed: ${error.message}`);
            throw new Error(`Guest checkout page verification failed: ${error.message}`);
        }
    }

    /**
     * Verifies that the checkout page has loaded successfully
     * Checks if CheckoutPageTemplateV2 layout is visible
     */
    async verifyCheckoutPage() {
        try {
            await this.checkoutPageLocator.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
        } catch (error: any) {
            console.error(`❌ Checkout page verification failed: ${error.message}`);
            throw new Error(`Checkout page verification failed: ${error.message}`);
        }
    }

    /**
     * Sets text to input element using complete CSS selector
     * @param selector - Complete CSS selector string (e.g., 'app-customer-info-v2 [aria-label="firstName"]')
     * @param value - Value to input
     */
    async setTextToInput(selector: string, value: string) {
        try {
            const input = this.page.locator(selector);
            await input.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await input.fill(value);
            await input.evaluate((el) => (el as HTMLElement).blur());
        } catch (error: any) {
            console.error(`❌ Failed to fill input with selector '${selector}': ${error.message}`);
            throw new Error(error.message);
        }
    }

    /**
     * Clicks guest sign in button
     */
    async clickGuestSignInButton() {
        try {
            const button = this.page.locator('button[data-an-la="account-login"]')
            await button.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await button.click();
        } catch (error: any) {
            console.error(`❌ Failed to click guest sign in button: ${error.message}`);
            throw new Error(error.message);
        }
    }

    /**
     * Clicks guest sign in button (CN specific)
     */
    async clickGuestSignInButtonForCN() {
        try {
            const button = this.page.locator('.checkout-login-link a[data-an-tr="account-login"], [data-an-tr="account-login"]')
            await button.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await button.click();
        } catch (error: any) {
            console.error(`❌ Failed to click guest sign in button for CN: ${error.message}`);
            throw new Error(error.message);
        }
    }

    /**
     * Clicks guest checkout button (second element)
     */
    async clickGuestCheckoutButton() {
        try {
            const button = this.page.locator('button[data-an-la="proceed to checkout:guest checkout"]').nth(1);
            await button.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await button.click();
        } catch (error: any) {
            console.error(`❌ Failed to click second guest checkout button: ${error.message}`);
            throw new Error(error.message);
        }
    }

    /**
     * Clicks dropdown button to open option list
     * @param dropdownSelector - CSS selector for dropdown button
     */
    async clickDropdown(dropdownSelector: string) {
        try {
            const dropdown = this.page.locator(dropdownSelector);
            await dropdown.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await dropdown.scrollIntoViewIfNeeded();
            await dropdown.click();
        } catch (error: any) {
            console.error(`❌ Failed to click dropdown with selector '${dropdownSelector}': ${error.message}`);
            throw new Error(error.message);
        }
    }

    /**
     * Selects first option from dropdown
     * @param optionSelector - CSS selector for option to select
     */
    async selectDropdownOptionFirst(optionSelector: string) {
        try {
            const option = this.page.locator(optionSelector).first();
            await option.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await option.click();
        } catch (error: any) {
            console.error(`❌ Failed to select first option with selector '${optionSelector}': ${error.message}`);
            throw new Error(error.message);
        }
    }

    /**
     * Finds and selects option with specific value from dropdown
     * @param optionSelector - CSS selector for option to select (with {{value}} placeholder)
     * @param value - Value of option to select
     */
    async selectDropdownOptionByValue(optionSelector: string, value: string) {
        try {
            const resolvedSelector = optionSelector.replace('{{value}}', value);
            const option = this.page.locator(resolvedSelector);
            await option.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await option.scrollIntoViewIfNeeded();
            // Additional scroll adjustment to better center the element
            const elementHandle = await option.elementHandle();
            if (elementHandle) {
                await this.page.evaluate((element) => {
                    element.scrollIntoView({ block: 'center', inline: 'center' });
                    window.scrollBy(0, 100); // Scroll down to better position the element
                }, elementHandle);
            }
            await option.click();
        } catch (error: any) {
            console.error(`❌ Failed to select option with value '${value}' using selector '${optionSelector}': ${error.message}`);
            throw new Error(error.message);
        }
    }

    /**
     * Sets Same as Shipping checkbox to desired state
     * @param shouldBeChecked - true to check, false to uncheck
     */
    async setSameAsShippingCheckbox(shouldBeChecked: boolean) {
        try {
            const checkbox = this.sameAsShippingCheckboxLocator;
            await checkbox.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            const isCurrentlyChecked = await checkbox.isChecked();

            if (shouldBeChecked && !isCurrentlyChecked) {
                await checkbox.click();
            } else if (!shouldBeChecked && isCurrentlyChecked) {
                await checkbox.click();
            }
        } catch (error: any) {
            console.error(`❌ Failed to set Same as Shipping checkbox: ${error.message}`);
            throw new Error(error.message);
        }
    }

    /**
     * Fills autocomplete input and clicks first item
     */
    async fillAutocompleteAndSelectFirst(
        inputSelector: string,
        query: string
    ) {
        const input = this.page.locator(inputSelector);
        await input.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
        await input.click();
        await input.fill(query);

        const firstOption = this.matOptionLocator.first();
        await firstOption.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });

        await firstOption.click();
    }

    /**
     * Clicks continue to next step button after completing checkout information
     * For AU site, this is the "Continue to delivery method" button
     */
    async clickContinueToNextStep() {
        try {
            const continueButton = this.continueToNextStepButtonLocator;
            await continueButton.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await continueButton.click();
        } catch (error: any) {
            console.error(`❌ Failed to click continue button: ${error.message}`);
            throw new Error(`Failed to click continue button: ${error.message}`);
        }
    }

    /**
     * Checks if customer address form is visible, and goes back if not visible
     */
    async checkCustomerAddressFormAndGoBack() {
        try {
            await this.page.waitForTimeout(5000);
            const customerAddressForm = this.customerAddressFormLocator;
            const isFormVisible = await customerAddressForm.isVisible({ timeout: 5000 }).catch(() => false);

            if (isFormVisible) {
                throw new Error('Page transition failed: Customer address form is still visible');
            } else {
                await this.page.goBack();
                return true;
            }
        } catch (error: any) {
            console.error(`❌ Error in checkCustomerAddressFormAndGoBack: ${error.message}`);
            throw new Error(`Error in checkCustomerAddressFormAndGoBack: ${error.message}`);
        }
    }

    /**
     * Verifies that checkboxes that should not be visible to guest users are not displayed
     */
    async verifyGuestCheckboxesNotDisplayed() {
        try {
            const customerAddressSaveCheckbox = this.customerAddressSaveCheckboxLocator;
            const isCustomerCheckboxVisible = await customerAddressSaveCheckbox.isVisible({ timeout: 5000 }).catch(() => false);

            if (isCustomerCheckboxVisible) {
                const errorMsg = "Checkbox 'Save Delivery Address' is displayed for guest";
                console.error(`❌ ${errorMsg}`);
                throw new Error(errorMsg);
            }

            const billingAddressSaveCheckbox = this.billingAddressSaveCheckboxLocator;
            const isBillingCheckboxVisible = await billingAddressSaveCheckbox.isVisible({ timeout: 5000 }).catch(() => false);

            if (isBillingCheckboxVisible) {
                const errorMsg = "Checkbox 'Save Billing Address' is displayed for guest";
                console.error(`❌ ${errorMsg}`);
                throw new Error(errorMsg);
            }
        } catch (error: any) {
            console.error(`❌ Error in verifyGuestCheckboxesNotDisplayed: ${error.message}`);
            throw new Error(`Error in verifyGuestCheckboxesNotDisplayed: ${error.message}`);
        }
    }

    /**
     * Clicks Continue to Payment button and verifies navigation to payment page
     */
    async continueToPayment() {
        try {
            await this.page.waitForTimeout(3000);
            const continueButton = this.continueToPaymentButtonLocator;
            await continueButton.waitFor({ state: 'visible', timeout: TIMEOUTS.STANDARD });
            await continueButton.click();

            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    await this.paymentModesAreaLocator.waitFor({ state: 'visible', timeout: 10000 });
                    return;
                } catch (error: any) {
                    if (attempt < 2) {
                        await this.page.reload();
                        await this.page.waitForLoadState('domcontentloaded');
                    } else {
                        console.error('❌ Failed to navigate to payment page after 2 attempts');
                        throw new Error('Not navigate to payment step after click continue button');
                    }
                }
            }
        } catch (error: any) {
            console.error(`❌ Failed to continue to payment: ${error.message}`);
            throw new Error(`Unable to click 'Continue to payment' button: ${error.message}`);
        }
    }

    async goToCheckoutPage(cart: Cart, config: any, utils: any) {
        try {
            await cart.expectCartPageIsOpen();

            if (await cart.checkoutButton.isVisible().catch(() => false)) {
                await cart.clickCheckoutButton();
                await this.verifySplashPage();
                await this.setTextToInput('[formcontrolname="guestEmail"],[data-automation-id="email"],[name="email"]', config.checkoutData.CustomerInfo.email);
                await utils.clickButton('button[data-an-tr="account-login"][data-an-la="guest"].pill-btn--blue');
            } else {
                await this.clickGuestCheckoutButton();
            }

            await this.verifyCheckoutPage();
        } catch (error: any) {
            console.error(`❌ Failed to go to checkout page: ${error.message}`);
            throw new Error(`Failed to go to checkout page: ${error.message}`);
        }
    }
    /**
     * @param filledValues - List of values to verify (Map format)
     */
    async verifyFilledValues(filledValues: any[]) {
        try {
            const contactInfoHeader = this.page.locator('.cms-header-component.checkout-contact-info-header');
            let deliveryInfo = '';

            if (await contactInfoHeader.isVisible({ timeout: 5000 }).catch(() => false)) {
                deliveryInfo = await contactInfoHeader.textContent() || '';
            }

            let billingInfo = deliveryInfo;
            const allowedKeys = [
                'firstName', 'lastName', 'line1', 'adminLevel2', 'postalCode', 'country'
            ];

            for (const item of filledValues) {
                if (item && typeof item === 'object') {
                    for (const [key, value] of Object.entries(item)) {
                        if (!allowedKeys.includes(key)) {
                            continue;
                        }

                        if (value === null || value === undefined) {
                            continue;
                        }

                        const valueStr = value.toString();

                        if (!deliveryInfo.includes(valueStr) && !billingInfo.includes(valueStr)) {
                            const errorMsg = `[${key}: ${valueStr}] is incorrect in collapse info`;
                            console.error(`❌ ${errorMsg}`);
                            throw new Error(errorMsg);
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error(`❌ Filled values verification failed: ${error.message}`);
            throw new Error(`Filled values verification failed: ${error.message}`);
        }
    }

    /**
     * Finds and selects delivery service option by text
     * @param text - Text to find (e.g., "Collection & Recycling")
     */
    async selectDeliveryServiceByText(text: string) {
        try {
            const elements = this.page.locator('app-checkout-step-delivery .service_list li');
            const count = await elements.count();

            if (count === 0) {
                throw new Error("No delivery service options found");
            }

            let targetElement: Locator | undefined;
            for (let i = 0; i < count; i++) {
                const element = elements.nth(i);
                const elementText = await element.textContent();
                if (elementText && elementText.includes(text)) {
                    targetElement = element;
                    break;
                }
            }

            if (!targetElement) {
                throw new Error(`No delivery service option found with text: "${text}"`);
            }

            await targetElement.scrollIntoViewIfNeeded();
            await targetElement.click();
        } catch (error: any) {
            console.error(`❌ Failed to select delivery service with text "${text}": ${error.message}`);
            throw new Error(`Failed to select delivery service with text "${text}": ${error.message}`);
        }
    }

    /**
     * Empties the cart
     */
    async emptyCart() {
        try {
            while (true) {
                const response = await this.page.request.get('/users/current/carts/current?fields=DEFAULT,appliedVouchers');
                const cartData = await response.json();

                if (!cartData.entries || cartData.entries.length === 0) {
                    break;
                }

                await this.page.request.delete(`/users/current/carts/current/entries/0`);
                await this.page.waitForTimeout(1000);
            }
        } catch (error: any) {
            console.warn(`⚠️ Unable to clear cart: ${error.message}`);
        }
    }

}