import { Checkout } from '../../Checkout';
import { expect } from '@playwright/test';

/**
 * Common checkout steps used in UK checkout tests
 */

export async function fillContactDetails(checkout: Checkout, config: any) {
    await checkout.clickDropdown(config.checkoutLocators.contactDetails.title);
    await checkout.selectDropdownOptionByValue(
        config.checkoutLocators.contactDetails.titleOption,
        config.checkoutData.CustomerInfo.title
    );

    await checkout.setTextToInput(config.checkoutLocators.contactDetails.firstName, config.checkoutData.CustomerInfo.firstName);
    await checkout.setTextToInput(config.checkoutLocators.contactDetails.lastName, config.checkoutData.CustomerInfo.lastName);
    await checkout.setTextToInput(config.checkoutLocators.contactDetails.phone, config.checkoutData.CustomerInfo.phoneNumber);
    await checkout.setTextToInput(config.checkoutLocators.contactDetails.email, config.checkoutData.CustomerInfo.email);
}

export async function fillDeliveryAddress(checkout: Checkout, config: any) {
    await checkout.fillAutocompleteAndSelectFirst(config.checkoutLocators.delivery.postCode, config.checkoutData.CustomerAddress.postalCode);
    await checkout.setTextToInput(config.checkoutLocators.delivery.addressLine1, config.checkoutData.CustomerAddress.line1);
    await checkout.setTextToInput(config.checkoutLocators.delivery.city, config.checkoutData.CustomerAddress.adminLevel2);
}

export async function fillBillingAddress(checkout: Checkout, config: any) {
    await checkout.setSameAsShippingCheckbox(false);

    await checkout.clickDropdown(config.checkoutLocators.billing.title);
    await checkout.selectDropdownOptionByValue(
        config.checkoutLocators.billing.titleOption,
        config.checkoutData.CustomerInfo.title
    );

    await checkout.setTextToInput(config.checkoutLocators.billing.firstName, config.checkoutData.CustomerInfo.firstName);
    await checkout.setTextToInput(config.checkoutLocators.billing.lastName, config.checkoutData.CustomerInfo.lastName);
    await checkout.setTextToInput(config.checkoutLocators.billing.email, config.checkoutData.CustomerInfo.email);

    await checkout.clickDropdown(config.checkoutLocators.billing.prefix);
    await checkout.selectDropdownOptionByValue(
        config.checkoutLocators.billing.prefixOption,
        config.checkoutData.CustomerInfo.phoneCode
    );

    await checkout.setTextToInput(config.checkoutLocators.billing.phone, config.checkoutData.CustomerInfo.phoneNumber);
    await checkout.fillAutocompleteAndSelectFirst(config.checkoutLocators.billing.postCode, config.checkoutData.BillingAddress.postalCode);
    await checkout.setTextToInput(config.checkoutLocators.billing.addressLine1, config.checkoutData.BillingAddress.line1);
    await checkout.setTextToInput(config.checkoutLocators.billing.city, config.checkoutData.BillingAddress.adminLevel2);
}

export async function completeCheckoutForm(checkout: Checkout, config: any) {
    try {
        await fillContactDetails(checkout, config);
        await fillDeliveryAddress(checkout, config);
        await fillBillingAddress(checkout, config);
    } catch (error: any) {
        console.error(`❌ Failed to complete checkout form: ${error.message}`);
        throw error;
    }
}

export async function prod_Checkout_01_UK(checkout: Checkout, config: any, cart: any, utils: any) {
    await completeCheckoutForm(checkout, config);
    await checkout.clickContinueToNextStep();
    await checkout.checkCustomerAddressFormAndGoBack();
    await checkout.verifyGuestCheckboxesNotDisplayed();
}

export async function prod_Checkout_02_UK(checkout: Checkout, config: any, cart: any, utils: any) {
    await cart.clickCheckoutButton();
    await checkout.verifyCheckoutPage();
    await fillContactDetails(checkout, config);
    await fillDeliveryAddress(checkout, config);
    await utils.clickButton('app-customer-address-v2 mat-checkbox:has(input[name="saveInAddressBook"])');
    await fillBillingAddress(checkout, config);
    await utils.clickButton('app-billing-address-v2 mat-checkbox:has(input[name="saveInAddressBook"])');
    await checkout.clickContinueToNextStep();
    await checkout.continueToPayment();
    await utils.clickButton('[data-an-la="checkout:customer details:edit"]');
    await utils.isElementVisible(
        '.shipping-form-v2.ng-star-inserted',
        'Shipping address form'
    );
    await utils.clickButton('app-customer-address-v2 mat-radio-button:has(input[value="NEW_ADDRESS"])');
    await utils.isElementVisible(
        'app-customer-address-v2 mat-checkbox:has(input[name="saveInAddressBook"])',
        'Save Delivery Address button'
    );
    await utils.isElementVisible(
        '.billing-form-v2.ng-star-inserted',
        'Billing address form'
    );
    await utils.clickButton('app-billing-address-v2 mat-radio-button:has(input[value="NEW_ADDRESS"])');
    await utils.isElementVisible(
        'app-billing-address-v2 mat-checkbox:has(input[name="saveInAddressBook"])',
        'Save Billing Address button'
    );
}

export async function prod_Checkout_03_UK(checkout: Checkout, config: any, cart: any, utils: any, page: any, myAccount: any) {
    try {
        await cart.clickCheckoutButton();
        await checkout.verifyCheckoutPage();
        await utils.clickButton(config.checkoutLocators.contactDetails.editButton);
        const titleField = page.locator(config.checkoutLocators.contactDetails.title);
        if (!(await titleField.inputValue().catch(() => ''))) {
            await checkout.clickDropdown(config.checkoutLocators.contactDetails.title);
            await checkout.selectDropdownOptionByValue(
                config.checkoutLocators.contactDetails.titleOption,
                config.checkoutData.CustomerInfo.title
            );
        }

        const firstNameField = page.locator(config.checkoutLocators.contactDetails.firstName);
        if (!(await firstNameField.inputValue().catch(() => ''))) {
            await checkout.setTextToInput(config.checkoutLocators.contactDetails.firstName, config.checkoutData.CustomerInfo.firstName);
        }

        const lastNameField = page.locator(config.checkoutLocators.contactDetails.lastName);
        if (!(await lastNameField.inputValue().catch(() => ''))) {
            await checkout.setTextToInput(config.checkoutLocators.contactDetails.lastName, config.checkoutData.CustomerInfo.lastName);
        }

        const phoneField = page.locator(config.checkoutLocators.contactDetails.phone);
        if (!(await phoneField.inputValue().catch(() => ''))) {
            await checkout.setTextToInput(config.checkoutLocators.contactDetails.phone, config.checkoutData.CustomerInfo.phoneNumber);
        }

        const emailField = page.locator(config.checkoutLocators.contactDetails.email);
        if (!(await emailField.inputValue().catch(() => ''))) {
            await checkout.setTextToInput(config.checkoutLocators.contactDetails.email, config.checkoutData.CustomerInfo.email);
        }
        const deliveryAddressSection = page.locator('h3.customer-address-title_v2:has-text("Delivery Address")');
        await expect(deliveryAddressSection).toBeVisible({ timeout: 5000 });
        const addressBox = page.locator('app-address-list-v2 .address-box');
        const addressLabel = page.locator('app-address-list-v2 .address-box .mdc-label');

        const hasAddressBox = await addressBox.isVisible().catch(() => false);
        const hasAddressLabel = await addressLabel.isVisible().catch(() => false);

        if (hasAddressBox && hasAddressLabel) {
            console.log('✓ Saved delivery address box and label are visible');
        } else {
            console.log('⚠️ Address box or label not found');
        }

        await checkout.setSameAsShippingCheckbox(false);
        const billingAddressSection = page.locator('h3:has-text("Billing Address")');
        await expect(billingAddressSection).toBeVisible({ timeout: 5000 });
        const billingAddressBox = page.locator('app-billing-address-v2 .address-box');
        const billingAddressLabel = page.locator('app-billing-address-v2.address-box .mdc-label');

        const hasBillingAddressBox = await billingAddressBox.isVisible().catch(() => false);
        const hasBillingAddressLabel = await billingAddressLabel.isVisible().catch(() => false);

        if (hasBillingAddressBox && hasBillingAddressLabel) {
            console.log('✓ Billing address box and label are visible');
        } else {
            console.log('⚠️ Billing address box or label not found');
        }

        await checkout.clickContinueToNextStep();
        await checkout.continueToPayment();
    } catch (error: any) {
        console.error(`❌ Failed to complete Prod_Checkout_03 checkout flow: ${error.message}`);
        throw error;
    }
}

export async function prod_Checkout_04_UK(checkout: Checkout, config: any, cart: any, utils: any, page: any) {
    await completeCheckoutForm(checkout, config);
    await checkout.clickContinueToNextStep();
    await checkout.continueToPayment();
    const filledValues = [
        config.checkoutData.CustomerInfo,
        config.checkoutData.CustomerAddress,
        config.checkoutData.BillingAddress
    ];
    await checkout.verifyFilledValues(filledValues);
}

export async function prod_Checkout_05_UK(checkout: Checkout, config: any, cart: any, utils: any, pd: any) {
    await completeCheckoutForm(checkout, config);
    await checkout.clickContinueToNextStep();
    await checkout.continueToPayment();
    await utils.page.locator('a[data-an-la="order summary:edit"]').first().click();
    await cart.clickCheckoutButton();
    await checkout.verifyCheckoutPage();
    await checkout.clickContinueToNextStep();
    await checkout.continueToPayment();
}

export async function prod_Checkout_05_1_UK(checkout: Checkout, config: any, utils: any) {
    await completeCheckoutForm(checkout, config);
    await checkout.clickContinueToNextStep();
    await checkout.continueToPayment();
    await utils.clickButton('[data-an-la="checkout:customer details:edit"]');
    await utils.isElementVisible(
        'app-customer-info-v2.ng-star-inserted',
        'Contact details form'
    );

    await utils.isElementVisible(
        '.shipping-form-v2.ng-pristine',
        'Shipping address form'
    );

    await utils.isElementVisible(
        '.billing-form-v2.ng-pristine',
        'Billing address form'
    );
    await checkout.clickContinueToNextStep();
    await checkout.continueToPayment();
    await utils.clickButton('[data-an-la="checkout:delivery options:edit"]');
    await utils.isElementVisible(
        '.delivery-info-wrapper',
        'Delivery edit form'
    );
    await checkout.continueToPayment();
    await utils.isElementVisible(
        '.payment-modes.v2.ng-star-inserted',
        'Payment form'
    );
}

export async function prod_Checkout_06_UK(checkout: Checkout, config: any, utils: any, page: any) {
    await completeCheckoutForm(checkout, config);
    await checkout.clickContinueToNextStep();
    await utils.clickButton(config.checkoutLocators.deliveryOptions.timeSlot);
    const dateOptions = page.locator(config.checkoutLocators.deliveryOptions.dateOption);
    await dateOptions.first().click();
    await utils.clickButton(config.checkoutLocators.deliveryOptions.timeSlotContinue);
    await checkout.continueToPayment();
    await utils.isElementVisible(
        '.payment-modes.v2.ng-star-inserted',
        'Payment form'
    );
}

export async function prod_Checkout_07_UK(checkout: Checkout, config: any, utils: any, page: any) {
    await completeCheckoutForm(checkout, config);
    await checkout.clickContinueToNextStep();
    await utils.clickButton('div[data-an-la="checkout:delivery options:store pickup"]');
    const pickupOptions = page.locator('app-checkout-step-delivery .delivery_list li .delivery-mode-tab');
    await pickupOptions.first().click();
    await utils.clickButton(config.checkoutLocators.deliveryOptions.timeSlot);
    const dateOptions = page.locator(config.checkoutLocators.deliveryOptions.dateOption);
    await dateOptions.first().click();
    await utils.clickButton(config.checkoutLocators.deliveryOptions.timeSlotContinue);
    await checkout.continueToPayment();
    await utils.isElementVisible(
        '.payment-modes.v2.ng-star-inserted',
        'Payment form'
    );
}

export async function prod_Checkout_08_UK(checkout: Checkout, config: any, utils: any, page: any) {
    await completeCheckoutForm(checkout, config);
    await checkout.clickContinueToNextStep();
    await utils.clickButton(config.checkoutLocators.deliveryOptions.option);
    await checkout.selectDeliveryServiceByText('Collection & Recycling');
    await utils.clickButton(config.checkoutLocators.deliveryOptions.timeSlot);
    const dateOptions = page.locator(config.checkoutLocators.deliveryOptions.dateOption);
    await dateOptions.first().click();
    await utils.clickButton(config.checkoutLocators.deliveryOptions.timeSlotContinue);
    await checkout.continueToPayment();
    await utils.isElementVisible(
        '.payment-modes.v2.ng-star-inserted',
        'Payment form'
    );
}

export async function prod_Checkout_09_UK(checkout: Checkout, config: any, cart: any, utils: any, page: any) {
    try {
        await completeCheckoutForm(checkout, config);
        await checkout.clickContinueToNextStep();
        await utils.clickButton(config.checkoutLocators.deliveryOptions.option);
        await checkout.selectDeliveryServiceByText('Installation');
        await utils.clickButton(config.checkoutLocators.deliveryOptions.timeSlot);
        const dateOptions = page.locator(config.checkoutLocators.deliveryOptions.dateOption);
        await dateOptions.first().click();
        await utils.clickButton(config.checkoutLocators.deliveryOptions.timeSlotContinue);
        await checkout.continueToPayment();
        await utils.isElementVisible(
            '.payment-modes.v2.ng-star-inserted',
            'Payment form'
        );
    } catch (error: any) {
        console.error(`❌ Failed to complete Prod_Checkout_09 checkout flow: ${error.message}`);
        throw error;
    }
}

export async function prod_Checkout_10_UK(checkout: Checkout, config: any, cart: any, utils: any, page: any) {
    try {
        await completeCheckoutForm(checkout, config);
        await checkout.clickContinueToNextStep();
        await utils.clickButton(config.checkoutLocators.deliveryOptions.option);
        await checkout.selectDeliveryServiceByText('Installation');
        await utils.clickButton(config.checkoutLocators.deliveryOptions.timeSlot);
        const dateOptions = page.locator(config.checkoutLocators.deliveryOptions.dateOption);
        await dateOptions.first().click();
        await utils.clickButton(config.checkoutLocators.deliveryOptions.timeSlotContinue);
        await checkout.continueToPayment();
        await utils.isElementVisible(
            '.payment-modes.v2.ng-star-inserted',
            'Payment form'
        );
    } catch (error: any) {
        console.error(`❌ Failed to complete Prod_Checkout_10 checkout flow: ${error.message}`);
        throw error;
    }
}

export async function prod_Payment_01_UK(checkout: Checkout, config: any, utils: any) {
    await fillContactDetails(checkout, config);
    await fillDeliveryAddress(checkout, config);
    await checkout.clickContinueToNextStep();
    await checkout.continueToPayment();
    await utils.isElementVisible(
        '.payment-modes.v2.ng-star-inserted',
        'Payment form'
    );
}
