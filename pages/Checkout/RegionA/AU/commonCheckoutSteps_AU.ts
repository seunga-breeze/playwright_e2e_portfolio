import { Checkout } from '../../Checkout';

/**
 * Common checkout steps shared across AU checkout tests
 */

/** Fills in the Contact Details section */
export async function fillContactDetails(checkout: Checkout, config: any) {
    console.log('===== CONTACT DETAILS =====');

    await checkout.setTextToInput(config.checkoutLocators.contactDetails.firstName, config.checkoutData.CustomerInfo.firstName);
    await checkout.setTextToInput(config.checkoutLocators.contactDetails.lastName, config.checkoutData.CustomerInfo.lastName);
    await checkout.setTextToInput(config.checkoutLocators.contactDetails.phone, config.checkoutData.CustomerInfo.phoneNumber);
    await checkout.setTextToInput(config.checkoutLocators.contactDetails.email, config.checkoutData.CustomerInfo.email);

    console.log('✓ Contact details completed successfully');
}

/** Fills in the Delivery Address section */
export async function fillDeliveryAddress(checkout: Checkout, config: any) {
    console.log('===== DELIVERY ADDRESS =====');

    await checkout.setTextToInput(config.checkoutLocators.delivery.addressLine1, config.checkoutData.CustomerAddress.line1);
    await checkout.setTextToInput(config.checkoutLocators.delivery.postalCode, config.checkoutData.CustomerAddress.postalCode);

    await checkout.clickDropdown(config.checkoutLocators.delivery.town);
    await checkout.selectDropdownOptionByValue(
        config.checkoutLocators.delivery.townOption,
        config.checkoutData.CustomerAddress.adminLevel2
    );

    await checkout.clickDropdown(config.checkoutLocators.delivery.regionIso);
    await checkout.selectDropdownOptionByValue(
        config.checkoutLocators.delivery.regionIsoOption,
        config.checkoutData.CustomerAddress.adminLevel1
    );

    console.log('✓ Delivery address completed successfully');
}

/** Fills in the Billing Address section */
export async function fillBillingAddress(checkout: Checkout, config: any) {
    console.log('===== BILLING ADDRESS =====');

    await checkout.setSameAsShippingCheckbox(false);

    await checkout.setTextToInput(config.checkoutLocators.billing.firstName, config.checkoutData.CustomerInfo.firstName);
    await checkout.setTextToInput(config.checkoutLocators.billing.lastName, config.checkoutData.CustomerInfo.lastName);
    await checkout.setTextToInput(config.checkoutLocators.billing.phone, config.checkoutData.CustomerInfo.phoneNumber);
    await checkout.setTextToInput(config.checkoutLocators.billing.addressLine1, config.checkoutData.BillingAddress.line1);
    await checkout.setTextToInput(config.checkoutLocators.billing.postalCode, config.checkoutData.BillingAddress.postalCode);

    await checkout.clickDropdown(config.checkoutLocators.billing.town);
    await checkout.selectDropdownOptionByValue(
        config.checkoutLocators.billing.townOption,
        config.checkoutData.BillingAddress.adminLevel2
    );

    await checkout.clickDropdown(config.checkoutLocators.billing.regionIso);
    await checkout.selectDropdownOptionByValue(
        config.checkoutLocators.billing.regionIsoOption,
        config.checkoutData.BillingAddress.adminLevel1
    );

    console.log('✓ Billing address completed successfully');
}

/** Completes the full checkout form (Contact Details, Delivery, Billing) */
export async function completeCheckoutForm(checkout: Checkout, config: any) {
    try {
        await fillContactDetails(checkout, config);
        await fillDeliveryAddress(checkout, config);
        await fillBillingAddress(checkout, config);

        console.log('🎉 Checkout form completed successfully!');
    } catch (error: any) {
        console.error(`❌ Failed to complete checkout form: ${error.message}`);
        throw error;
    }
}

export async function prod_Checkout_01_AU(checkout: Checkout, config: any, cart: any, utils: any) {

    await completeCheckoutForm(checkout, config);

    await checkout.clickContinueToNextStep();

    await checkout.checkCustomerAddressFormAndGoBack();

    await checkout.verifyGuestCheckboxesNotDisplayed();

}
