// ── TradeIn ──────────────────────────────────────────────────────────────────

export interface TradeInDevice {
  type: 'phone' | 'watch' | 'tablet';
  category: string;
  brand: string;
  model?: string;
  device?: string;
  storage?: string;
  screanSize?: string; // matches key in tradeIn.json
}

export interface TradeInDeviceGroup {
  siteCode: string;
  devices: TradeInDevice[];
  phone: TradeInDevice | undefined;
  watch: TradeInDevice | undefined;
  tablet: TradeInDevice | undefined;
}

// ── BC (Buy Configuration) ────────────────────────────────────────────────────

export interface BCPhoneConfig {
  device: string;
  color: string;
  storage: string;
  sku: string;
  url?: string;
}

export interface BCTabletConfig {
  device: string;
  color: string;
  storage: string;
  connectivity: string;
  sku: string;
}

export interface BCWatchConfig {
  device: string;
  caseColor: string;
  caseSize: string;
  connectivity: string;
  sku: string;
}

export interface BCBookConfig {
  device: string;
  os: string;
  color: string;
  bookMemory: string;
  bookStorage: string;
  connectivity: string;
  screen: string;
  processor: string;
  graphics: string;
  sku: string;
}

// ── PD (Product Detail) ───────────────────────────────────────────────────────

export interface PDProductConfig {
  Url: string;
  SKU: string;
  DeviceName?: string;
  Color?: string;
  Storage?: string;
  PFUrl?: string;
}

// ── Trade-Up ──────────────────────────────────────────────────────────────────

export interface TradeUpSiteData {
  PostalCode?: string;
  postalCode?: string;
  model?: string;
  brand?: string;
}

// ── Reward ────────────────────────────────────────────────────────────────────

export interface RewardSummaryConfig {
  // AU keys
  SummaryTieringMessage?: string;
  SummaryRewardsBenefit?: string;
  SummaryRewardsEstimatedPoints?: string;
  SummaryEnrollRewards?: string;
  RewardEarningPointRate?: number;
  // UK keys
  tieringMessage?: string;
  rewardsbenefit?: string;
  EstimatedRewardsPoints?: string;
  EnrollRewards?: string;
}

// ── Checkout data (Checkout.json) ─────────────────────────────────────────────

export interface CheckoutCustomerInfo {
  email?: string;
  title?: string;
  firstName: string;
  lastName: string;
  phoneCode?: string;
  phoneNumber?: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface CheckoutAddress {
  country?: string;
  postalCode?: string;
  line1: string;
  adminLevel1?: string;
  adminLevel2?: string;
  searchAddress?: string;
}

export interface CheckoutData {
  CustomerInfo: CheckoutCustomerInfo;
  CustomerAddress: CheckoutAddress;
  BillingAddress: CheckoutAddress;
}

// ── Checkout locators (CheckoutLocator.json) ──────────────────────────────────

export interface CheckoutContactLocators {
  title?: string;
  titleOption?: string;
  firstName: string;
  lastName: string;
  email: string;
  guestEmail?: string;
  phone: string;
  editButton?: string;
}

export interface CheckoutDeliveryLocators {
  postCode?: string;
  postalCode?: string;
  addressLine1: string;
  city?: string;
  town?: string;
  townOption?: string;
  regionIso?: string;
  regionIsoOption?: string;
  suburb?: string;
}

export interface CheckoutBillingLocators {
  title?: string;
  titleOption?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  prefix?: string;
  prefixOption?: string;
  phone?: string;
  postCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  town?: string;
  townOption?: string;
  regionIso?: string;
  regionIsoOption?: string;
  city?: string;
}

export interface CheckoutDeliveryOptionLocators {
  category: string;
  option: string;
  timeSlot: string;
  datePicker: string;
  dateOption: string;
  timeSlotContinue: string;
}

export interface CheckoutLocators {
  contactDetails: CheckoutContactLocators;
  delivery: CheckoutDeliveryLocators;
  billing: CheckoutBillingLocators;
  deliveryOptions?: CheckoutDeliveryOptionLocators;
}

// ── MyAccount data (MyAccount.json) ──────────────────────────────────────────

export interface MyAccountAddressData {
  titleCode?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  postalCode: string;
  line1: string;
  town: string;
  regionIso?: string;
}

export interface MyAccountOrderData {
  orderId: string;
  emailId: string;
}

export interface MyAccountData {
  addresses: MyAccountAddressData;
  orders: MyAccountOrderData;
}

// ── MyAccount locators (MyAccountLocator.json) ────────────────────────────────

export interface MyAccountLocatorOverrides {
  billingTab?: string;
  saveButton?: string;
  editSaveButton?: string;
  editBillingSaveButton?: string;
  [key: string]: string | undefined;
}

export interface MyAccountLocators {
  editProfileLink: string;
  deliveryTab: string;
  billingTab: string;
  addAddressButton: string;
  viewMoreButton: string;
  editAddressButton: string;
  removeAddressButton: string;
  removeConfirmButton: string;
  dialogTitle: string;
  saveButton: string;
  editSaveButton: string;
  editBillingSaveButton: string;
  countryOverrides?: Record<string, MyAccountLocatorOverrides>;
  [key: string]: string | Record<string, MyAccountLocatorOverrides> | undefined;
}

// ── Full project config (metadata injected via playwright.config.ts) ──────────

export interface ProjectConfig {
  // From default.json
  baseUrl: string;
  bcUrl: string;
  shopUrl: string;
  searchAPIPath: string;

  // Site identity
  name: string;
  siteCode: string;
  currencyMark?: string;
  currencyCode?: string;

  // BC configs
  BC_Phone?: BCPhoneConfig;
  BC_Tablet?: BCTabletConfig;
  BC_Watch?: BCWatchConfig;
  BC_Book?: BCBookConfig;

  // PD configs
  PD_IM1?: PDProductConfig;
  PD_VD1?: PDProductConfig;
  PD_VD2?: PDProductConfig;
  PD_HA1?: PDProductConfig;
  PD_HA2?: PDProductConfig;
  PD_IT1?: PDProductConfig;
  PD_IT2?: PDProductConfig;
  PD_Bespoke?: PDProductConfig;
  PD_DM_Pickup?: PDProductConfig;
  PD_DM_Delivery?: PDProductConfig;
  PD_DM_PickupRecycling?: PDProductConfig;
  PD_With_tradeUp?: PDProductConfig;

  // Other site-level configs
  DeliveryCalendar?: string;
  RewardSummary?: RewardSummaryConfig;
  TradeUpData?: TradeUpSiteData;

  // Credentials (loaded from env per site)
  LOGIN_ID?: string;
  LOGIN_PW?: string;
  REWARD_LOGIN_ID?: string;
  REWARD_LOGIN_PW?: string;

  // Runtime-loaded data (injected by playwright.config.ts)
  tradeInDevices: TradeInDevice[];
  checkoutData?: CheckoutData;
  checkoutLocators?: CheckoutLocators;
  myAccountData?: MyAccountData;
  myAccountLocators: MyAccountLocators;
  naTests: string[];
}
