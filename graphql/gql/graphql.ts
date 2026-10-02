/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /**
   * The `GenericScalar` scalar type represents a generic
   * GraphQL scalar value that could be:
   * String, Boolean, Int, Float, List or Object.
   */
  GenericScalar: { input: any; output: any; }
};

export type AddAddressInput = {
  city: InputMaybe<Scalars['String']['input']>;
  countryId: Scalars['Int']['input'];
  email: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  stateId: InputMaybe<Scalars['Int']['input']>;
  street: Scalars['String']['input'];
  street2: InputMaybe<Scalars['String']['input']>;
  zip: Scalars['String']['input'];
};

export enum AddressEnum {
  Billing = 'Billing',
  Shipping = 'Shipping'
}

export type AddressFilterInput = {
  addressType: InputMaybe<Array<InputMaybe<AddressEnum>>>;
};

/** An enumeration. */
export enum AddressType {
  Contact = 'Contact',
  DeliveryAddress = 'DeliveryAddress',
  InvoiceAddress = 'InvoiceAddress',
  OtherAddress = 'OtherAddress',
  PrivateAddress = 'PrivateAddress'
}

export type ApplyCouponList = ApplyCoupons & {
  __typename?: 'ApplyCouponList';
  error: Maybe<Scalars['String']['output']>;
  order: Maybe<Order>;
};

export type ApplyCoupons = {
  error: Maybe<Scalars['String']['output']>;
  order: Maybe<Order>;
};

export type ApplyGiftCardList = ApplyGiftCards & {
  __typename?: 'ApplyGiftCardList';
  error: Maybe<Scalars['String']['output']>;
  order: Maybe<Order>;
};

export type ApplyGiftCards = {
  error: Maybe<Scalars['String']['output']>;
  order: Maybe<Order>;
};

export type Attribute = {
  __typename?: 'Attribute';
  displayType: Maybe<Scalars['String']['output']>;
  filterVisibility: Maybe<FilterVisibility>;
  id: Scalars['Int']['output'];
  name: Maybe<Scalars['String']['output']>;
  values: Maybe<Array<AttributeValue>>;
  variantCreateMode: Maybe<VariantCreateMode>;
};

export type AttributeValue = {
  __typename?: 'AttributeValue';
  attribute: Maybe<Attribute>;
  displayType: Maybe<Scalars['String']['output']>;
  htmlColor: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Maybe<Scalars['String']['output']>;
  /** Not use in the return Attributes List of the Products Query */
  priceExtra: Maybe<Scalars['Float']['output']>;
  search: Maybe<Scalars['String']['output']>;
};

/**
 * Ids the storefront found inside the blocks.
 *
 * Odoo cannot extract these itself - the blocks column is opaque to it - so
 * the layer that understands the content mirrors them in. They exist to
 * answer "which live pages reference product X?", which is how a product
 * change invalidates the right pages.
 */
export type BlockReferencesInput = {
  attachmentIds: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  categoryIds: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  productTmplIds: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
};

export type BlogPost = {
  __typename?: 'BlogPost';
  author: Maybe<Partner>;
  content: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  image: Maybe<Scalars['String']['output']>;
  imageFilename: Maybe<Scalars['String']['output']>;
  imageUrl: Maybe<Scalars['String']['output']>;
  jsonLd: Maybe<Scalars['GenericScalar']['output']>;
  name: Maybe<Scalars['String']['output']>;
  publishedDate: Maybe<Scalars['String']['output']>;
  slug: Maybe<Scalars['String']['output']>;
  tags: Maybe<Array<BlogTag>>;
  teaser: Maybe<Scalars['String']['output']>;
};

export type BlogPostFilterInput = {
  tagId: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  tagSlug: InputMaybe<Scalars['String']['input']>;
};

export type BlogPostList = BlogPosts & {
  __typename?: 'BlogPostList';
  blogPosts: Maybe<Array<Maybe<BlogPost>>>;
  blogTags: Maybe<Array<Maybe<BlogTag>>>;
  totalCount: Scalars['Int']['output'];
};

export type BlogPostSortInput = {
  id: InputMaybe<SortEnum>;
  name: InputMaybe<SortEnum>;
  publishedDate: InputMaybe<SortEnum>;
};

export type BlogPosts = {
  blogPosts: Maybe<Array<Maybe<BlogPost>>>;
  blogTags: Maybe<Array<Maybe<BlogTag>>>;
  totalCount: Scalars['Int']['output'];
};

export type BlogTag = {
  __typename?: 'BlogTag';
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  slug: Maybe<Scalars['String']['output']>;
};

export type BlogTagList = BlogTags & {
  __typename?: 'BlogTagList';
  blogTags: Maybe<Array<Maybe<BlogTag>>>;
  totalCount: Scalars['Int']['output'];
};

export type BlogTags = {
  blogTags: Maybe<Array<Maybe<BlogTag>>>;
  totalCount: Scalars['Int']['output'];
};

export type Cart = {
  frequentlyBoughtTogether: Maybe<Array<Maybe<Product>>>;
  order: Maybe<Order>;
};

export type CartData = Cart & {
  __typename?: 'CartData';
  frequentlyBoughtTogether: Maybe<Array<Maybe<Product>>>;
  order: Maybe<Order>;
};

export type CartLineInput = {
  id: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
};

export type Categories = {
  categories: Maybe<Array<Maybe<Category>>>;
  totalCount: Scalars['Int']['output'];
};

export type Category = {
  __typename?: 'Category';
  breadcrumb: Maybe<Scalars['GenericScalar']['output']>;
  childs: Maybe<Array<Category>>;
  id: Scalars['Int']['output'];
  image: Maybe<Scalars['String']['output']>;
  imageFilename: Maybe<Scalars['String']['output']>;
  imageUrl: Maybe<Scalars['String']['output']>;
  jsonLd: Maybe<Scalars['GenericScalar']['output']>;
  metaDescription: Maybe<Scalars['String']['output']>;
  metaImage: Maybe<Scalars['String']['output']>;
  metaKeyword: Maybe<Scalars['String']['output']>;
  metaTitle: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  parent: Maybe<Category>;
  slug: Maybe<Scalars['String']['output']>;
};

export type CategoryFilterInput = {
  id: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  parent: InputMaybe<Scalars['Boolean']['input']>;
};

export type CategoryList = Categories & {
  __typename?: 'CategoryList';
  categories: Maybe<Array<Maybe<Category>>>;
  totalCount: Scalars['Int']['output'];
};

export type CategorySortInput = {
  id: InputMaybe<SortEnum>;
};

export type CheckoutRedirectOutput = {
  __typename?: 'CheckoutRedirectOutput';
  accessToken: Maybe<Scalars['String']['output']>;
};

export type CmsLocale = {
  __typename?: 'CmsLocale';
  code: Maybe<Scalars['String']['output']>;
  isDefault: Maybe<Scalars['Boolean']['output']>;
  label: Maybe<Scalars['String']['output']>;
};

export type CmsPage = {
  __typename?: 'CmsPage';
  /** How many blocks the draft holds. A count rather than the blocks themselves, so the page list stays small. */
  blockCount: Maybe<Scalars['Int']['output']>;
  blocks: Maybe<Scalars['GenericScalar']['output']>;
  draftBlocks: Maybe<Scalars['GenericScalar']['output']>;
  hasUnpublishedChanges: Maybe<Scalars['Boolean']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  isPublished: Maybe<Scalars['Boolean']['output']>;
  liveRevision: Maybe<Scalars['Int']['output']>;
  metaDescription: Maybe<Scalars['String']['output']>;
  metaTitle: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  revisionCount: Maybe<Scalars['Int']['output']>;
  updatedAt: Maybe<Scalars['String']['output']>;
  url: Maybe<Scalars['String']['output']>;
};

export type CmsPageList = {
  __typename?: 'CmsPageList';
  pages: Maybe<Array<Maybe<CmsPage>>>;
  totalCount: Maybe<Scalars['Int']['output']>;
};

/** A product or category a merchant can pick in the inspector. */
export type CmsRefOption = {
  __typename?: 'CmsRefOption';
  id: Maybe<Scalars['Int']['output']>;
  imageUrl: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
};

export type Company = {
  __typename?: 'Company';
  city: Maybe<Scalars['String']['output']>;
  country: Maybe<Country>;
  email: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image: Maybe<Scalars['String']['output']>;
  imageFilename: Maybe<Scalars['String']['output']>;
  imageUrl: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  phone: Maybe<Scalars['String']['output']>;
  socialFacebook: Maybe<Scalars['String']['output']>;
  socialGithub: Maybe<Scalars['String']['output']>;
  socialInstagram: Maybe<Scalars['String']['output']>;
  socialLinkedin: Maybe<Scalars['String']['output']>;
  socialTwitter: Maybe<Scalars['String']['output']>;
  socialYoutube: Maybe<Scalars['String']['output']>;
  state: Maybe<State>;
  street: Maybe<Scalars['String']['output']>;
  street2: Maybe<Scalars['String']['output']>;
  vat: Maybe<Scalars['String']['output']>;
  zip: Maybe<Scalars['String']['output']>;
};

export type ContactUsParams = {
  attachments: InputMaybe<Array<InputMaybe<ContactusAttachmentInput>>>;
  company: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  message: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  subject: Scalars['String']['input'];
};

export type ContactusAttachmentInput = {
  fileData: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type Countries = {
  countries: Maybe<Array<Maybe<Country>>>;
  totalCount: Scalars['Int']['output'];
};

export type Country = {
  __typename?: 'Country';
  code: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  states: Maybe<Array<State>>;
};

export type CountryFilterInput = {
  id: InputMaybe<Scalars['Int']['input']>;
};

export type CountryList = Countries & {
  __typename?: 'CountryList';
  countries: Maybe<Array<Maybe<Country>>>;
  totalCount: Scalars['Int']['output'];
};

export type CountrySortInput = {
  id: InputMaybe<SortEnum>;
};

export type Coupon = {
  __typename?: 'Coupon';
  code: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
};

export type Currency = {
  __typename?: 'Currency';
  id: Scalars['Int']['output'];
  name: Maybe<Scalars['String']['output']>;
  symbol: Maybe<Scalars['String']['output']>;
};

export type DeleteAddress = {
  __typename?: 'DeleteAddress';
  result: Maybe<Scalars['Boolean']['output']>;
};

export type DeleteAddressInput = {
  id: Scalars['Int']['input'];
};

/** An enumeration. */
export enum FilterVisibility {
  Hidden = 'Hidden',
  Visible = 'Visible'
}

export type GiftCard = {
  __typename?: 'GiftCard';
  code: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
};

export type Homepage = {
  jsonLd: Maybe<Scalars['GenericScalar']['output']>;
  metaDescription: Maybe<Scalars['String']['output']>;
  metaImage: Maybe<Scalars['String']['output']>;
  metaImageFilename: Maybe<Scalars['String']['output']>;
  metaKeyword: Maybe<Scalars['String']['output']>;
  metaTitle: Maybe<Scalars['String']['output']>;
};

export type HomepageList = Homepage & {
  __typename?: 'HomepageList';
  jsonLd: Maybe<Scalars['GenericScalar']['output']>;
  metaDescription: Maybe<Scalars['String']['output']>;
  metaImage: Maybe<Scalars['String']['output']>;
  metaImageFilename: Maybe<Scalars['String']['output']>;
  metaKeyword: Maybe<Scalars['String']['output']>;
  metaTitle: Maybe<Scalars['String']['output']>;
};

export type Invoice = {
  __typename?: 'Invoice';
  amountResidual: Maybe<Scalars['Float']['output']>;
  amountTax: Maybe<Scalars['Float']['output']>;
  amountTotal: Maybe<Scalars['Float']['output']>;
  amountUntaxed: Maybe<Scalars['Float']['output']>;
  currency: Maybe<Currency>;
  id: Scalars['Int']['output'];
  invoiceDate: Maybe<Scalars['String']['output']>;
  invoiceDateDue: Maybe<Scalars['String']['output']>;
  invoiceLines: Maybe<Array<InvoiceLine>>;
  invoiceUrl: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  partner: Maybe<Partner>;
  partnerShipping: Maybe<Partner>;
  state: Maybe<InvoiceState>;
  taxTotals: Maybe<Scalars['GenericScalar']['output']>;
  transactions: Maybe<Array<PaymentTransaction>>;
};

export type InvoiceLine = {
  __typename?: 'InvoiceLine';
  id: Scalars['Int']['output'];
  name: Maybe<Scalars['String']['output']>;
  priceSubtotal: Maybe<Scalars['Float']['output']>;
  priceTotal: Maybe<Scalars['Float']['output']>;
  priceUnit: Maybe<Scalars['Float']['output']>;
  product: Maybe<Product>;
  quantity: Maybe<Scalars['Float']['output']>;
};

export type InvoiceList = Invoices & {
  __typename?: 'InvoiceList';
  invoices: Maybe<Array<Maybe<Invoice>>>;
  totalCount: Scalars['Int']['output'];
};

export type InvoiceSortInput = {
  id: InputMaybe<SortEnum>;
  invoiceDate: InputMaybe<SortEnum>;
  name: InputMaybe<SortEnum>;
  state: InputMaybe<SortEnum>;
};

/** An enumeration. */
export enum InvoiceState {
  Cancelled = 'Cancelled',
  Draft = 'Draft',
  Posted = 'Posted'
}

/** An enumeration. */
export enum InvoiceStatus {
  FullyInvoiced = 'FullyInvoiced',
  NothingtoInvoice = 'NothingtoInvoice',
  ToInvoice = 'ToInvoice',
  UpsellingOpportunity = 'UpsellingOpportunity'
}

export type Invoices = {
  invoices: Maybe<Array<Maybe<Invoice>>>;
  totalCount: Scalars['Int']['output'];
};

export type Lead = {
  __typename?: 'Lead';
  company: Maybe<Scalars['String']['output']>;
  email: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  message: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  phone: Maybe<Scalars['String']['output']>;
  subject: Maybe<Scalars['String']['output']>;
};

export type LoginOutput = {
  __typename?: 'LoginOutput';
  cart: Maybe<Order>;
  user: Maybe<User>;
  wishlistItems: Maybe<Array<Maybe<WishlistItem>>>;
};

export type MailingContact = {
  __typename?: 'MailingContact';
  companyName: Maybe<Scalars['String']['output']>;
  email: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  subscriptionList: Maybe<Array<MailingContactSubscription>>;
};

export type MailingContactFilterInput = {
  id: InputMaybe<Scalars['Int']['input']>;
};

export type MailingContactList = MailingContacts & {
  __typename?: 'MailingContactList';
  mailingContacts: Maybe<Array<Maybe<MailingContact>>>;
  totalCount: Scalars['Int']['output'];
};

export type MailingContactSortInput = {
  id: InputMaybe<SortEnum>;
};

export type MailingContactSubscription = {
  __typename?: 'MailingContactSubscription';
  id: Scalars['Int']['output'];
  mailingList: Maybe<MailingList>;
  optOut: Maybe<Scalars['Boolean']['output']>;
};

export type MailingContacts = {
  mailingContacts: Maybe<Array<Maybe<MailingContact>>>;
  totalCount: Scalars['Int']['output'];
};

export type MailingInput = {
  mailinglistId: Scalars['Int']['input'];
  optout: Scalars['Boolean']['input'];
};

export type MailingList = {
  __typename?: 'MailingList';
  id: Scalars['Int']['output'];
  name: Maybe<Scalars['String']['output']>;
};

export type MailingListFilterInput = {
  id: InputMaybe<Scalars['Int']['input']>;
};

export type MailingListList = MailingLists & {
  __typename?: 'MailingListList';
  mailingLists: Maybe<Array<Maybe<MailingList>>>;
  totalCount: Scalars['Int']['output'];
};

export type MailingListSortInput = {
  id: InputMaybe<SortEnum>;
};

export type MailingLists = {
  mailingLists: Maybe<Array<Maybe<MailingList>>>;
  totalCount: Scalars['Int']['output'];
};

export type MakeGiftCardPayment = {
  __typename?: 'MakeGiftCardPayment';
  done: Maybe<Scalars['Boolean']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Add new billing or shipping address and set it on the shopping cart. */
  addAddress: Maybe<Partner>;
  /** Apply Coupon */
  applyCoupon: Maybe<ApplyCouponList>;
  /** Apply Gift Card */
  applyGiftCard: Maybe<ApplyGiftCardList>;
  /** Add Multiple Items */
  cartAddMultipleItems: Maybe<CartData>;
  /** Cart Clear */
  cartClear: Maybe<Order>;
  /** Remove Multiple Items */
  cartRemoveMultipleItems: Maybe<CartData>;
  /** Update Multiple Items */
  cartUpdateMultipleItems: Maybe<CartData>;
  /** Set new user's password with the token from the change password url received in the email. */
  changePassword: Maybe<User>;
  /** Returns access token to redirect user to Odoo checkout */
  checkoutRedirect: Maybe<CheckoutRedirectOutput>;
  /** Creates a new lead with the contact information. */
  contactUs: Maybe<Lead>;
  createCmsPage: Maybe<CmsPage>;
  /** Create or update a partner for guest checkout */
  createUpdatePartner: Maybe<Partner>;
  /** Delete a billing or shipping address. */
  deleteAddress: Maybe<DeleteAddress>;
  deleteCmsPage: Maybe<Scalars['Boolean']['output']>;
  /** Delete MyAccount */
  deleteMyAccount: Maybe<Scalars['Boolean']['output']>;
  /** Reset the draft to what is live. */
  discardCmsDraft: Maybe<CmsPage>;
  /** Authenticate user with email and password and retrieves token. */
  login: Maybe<LoginOutput>;
  /** Logout user */
  logout: Maybe<Scalars['Boolean']['output']>;
  /** Pay the order only with gift card. */
  makeGiftCardPayment: Maybe<MakeGiftCardPayment>;
  /** Subscribe to newsletter. */
  newsletterSubscribe: Maybe<NewsletterSubscribe>;
  /** Copy the draft into a new live revision. */
  publishCmsPage: Maybe<CmsPage>;
  /** Register a new user with email, name and password. */
  register: Maybe<User>;
  /** Send change password url to user's email. */
  resetPassword: Maybe<User>;
  /** Copy an older revision forward and make it live. */
  restoreCmsRevision: Maybe<CmsPage>;
  /** Replace a page draft. */
  saveCmsDraft: Maybe<CmsPage>;
  /** Select a billing or shipping address to be used on the shopping cart. */
  selectAddress: Maybe<Partner>;
  /** Set Shipping Method on Cart */
  setShippingMethod: Maybe<CartData>;
  /** Two-Factor Verification */
  totpVerification: Maybe<TwoFactorOutput>;
  /** Hide a page from visitors. */
  unpublishCmsPage: Maybe<CmsPage>;
  /** Update a billing or shipping address and set it on the shopping cart. */
  updateAddress: Maybe<Partner>;
  updateCmsPage: Maybe<CmsPage>;
  /** Update MyAccount */
  updateMyAccount: Maybe<Partner>;
  /** Update user password. */
  updatePassword: Maybe<User>;
  /** Create or Update Multiple Mailing Contact information */
  userAddMultipleMailing: Maybe<MailingContact>;
  /** Add Item */
  wishlistAddItem: Maybe<WishlistData>;
  /** Remove Item */
  wishlistRemoveItem: Maybe<WishlistData>;
};


export type MutationAddAddressArgs = {
  address: InputMaybe<AddAddressInput>;
  type: AddressEnum;
};


export type MutationApplyCouponArgs = {
  promo: InputMaybe<Scalars['String']['input']>;
};


export type MutationApplyGiftCardArgs = {
  promo: InputMaybe<Scalars['String']['input']>;
};


export type MutationCartAddMultipleItemsArgs = {
  products: Array<InputMaybe<ProductInput>>;
};


export type MutationCartRemoveMultipleItemsArgs = {
  lineIds: Array<InputMaybe<Scalars['Int']['input']>>;
};


export type MutationCartUpdateMultipleItemsArgs = {
  lines: Array<InputMaybe<CartLineInput>>;
};


export type MutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationCheckoutRedirectArgs = {
  sessionId: Scalars['String']['input'];
};


export type MutationContactUsArgs = {
  contactus: InputMaybe<ContactUsParams>;
};


export type MutationCreateCmsPageArgs = {
  blocks: InputMaybe<Scalars['GenericScalar']['input']>;
  name: Scalars['String']['input'];
  url: Scalars['String']['input'];
};


export type MutationCreateUpdatePartnerArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone: InputMaybe<Scalars['String']['input']>;
  subscribeNewsletter: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationDeleteAddressArgs = {
  address: InputMaybe<DeleteAddressInput>;
};


export type MutationDeleteCmsPageArgs = {
  pageId: Scalars['Int']['input'];
};


export type MutationDiscardCmsDraftArgs = {
  pageId: Scalars['Int']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  subscribeNewsletter?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationNewsletterSubscribeArgs = {
  email: InputMaybe<Scalars['String']['input']>;
};


export type MutationPublishCmsPageArgs = {
  pageId: Scalars['Int']['input'];
  references: InputMaybe<BlockReferencesInput>;
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  subscribeNewsletter?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationResetPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationRestoreCmsRevisionArgs = {
  pageId: Scalars['Int']['input'];
  revisionId: Scalars['Int']['input'];
};


export type MutationSaveCmsDraftArgs = {
  blocks: Scalars['GenericScalar']['input'];
  expectedWriteDate: InputMaybe<Scalars['String']['input']>;
  pageId: Scalars['Int']['input'];
};


export type MutationSelectAddressArgs = {
  address: InputMaybe<SelectAddressInput>;
  type: AddressEnum;
};


export type MutationSetShippingMethodArgs = {
  shippingMethodId: Scalars['Int']['input'];
};


export type MutationTotpVerificationArgs = {
  code: Scalars['String']['input'];
  rememberDevice?: InputMaybe<Scalars['Boolean']['input']>;
  userId: Scalars['Int']['input'];
};


export type MutationUnpublishCmsPageArgs = {
  pageId: Scalars['Int']['input'];
};


export type MutationUpdateAddressArgs = {
  address: UpdateAddressInput;
};


export type MutationUpdateCmsPageArgs = {
  metaDescription: InputMaybe<Scalars['String']['input']>;
  metaTitle: InputMaybe<Scalars['String']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  pageId: Scalars['Int']['input'];
  url: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateMyAccountArgs = {
  myaccount: InputMaybe<UpdateMyAccountParams>;
};


export type MutationUpdatePasswordArgs = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};


export type MutationUserAddMultipleMailingArgs = {
  mailings: Array<InputMaybe<MailingInput>>;
};


export type MutationWishlistAddItemArgs = {
  productId: Scalars['Int']['input'];
};


export type MutationWishlistRemoveItemArgs = {
  wishId: Scalars['Int']['input'];
};

export type NewsletterSubscribe = {
  __typename?: 'NewsletterSubscribe';
  subscribed: Maybe<Scalars['Boolean']['output']>;
};

export type Order = {
  __typename?: 'Order';
  amountDelivery: Maybe<Scalars['Float']['output']>;
  amountDiscounts: Maybe<Scalars['Float']['output']>;
  amountGiftCards: Maybe<Scalars['Float']['output']>;
  amountSubtotal: Maybe<Scalars['Float']['output']>;
  amountTax: Maybe<Scalars['Float']['output']>;
  amountTotal: Maybe<Scalars['Float']['output']>;
  amountUntaxed: Maybe<Scalars['Float']['output']>;
  cartQuantity: Maybe<Scalars['Int']['output']>;
  clientOrderRef: Maybe<Scalars['String']['output']>;
  coupons: Maybe<Array<Coupon>>;
  currency: Maybe<Currency>;
  currencyRate: Maybe<Scalars['String']['output']>;
  dateOrder: Maybe<Scalars['String']['output']>;
  giftCards: Maybe<Array<GiftCard>>;
  id: Scalars['Int']['output'];
  invoiceCount: Maybe<Scalars['Int']['output']>;
  invoiceStatus: Maybe<InvoiceStatus>;
  lastTransaction: Maybe<PaymentTransaction>;
  name: Maybe<Scalars['String']['output']>;
  orderLines: Maybe<Array<OrderLine>>;
  orderUrl: Maybe<Scalars['String']['output']>;
  partner: Maybe<Partner>;
  partnerInvoice: Maybe<Partner>;
  partnerShipping: Maybe<Partner>;
  reportOrderLine: Maybe<Array<OrderLine>>;
  shippingMethod: Maybe<ShippingMethod>;
  stage: Maybe<OrderStage>;
  taxTotals: Maybe<Scalars['GenericScalar']['output']>;
  transactions: Maybe<Array<PaymentTransaction>>;
  websiteOrderLine: Maybe<Array<OrderLine>>;
};

export type OrderFilterInput = {
  invoiceStatus: InputMaybe<Array<InputMaybe<InvoiceStatus>>>;
  stages: InputMaybe<Array<InputMaybe<OrderStage>>>;
};

export type OrderLine = {
  __typename?: 'OrderLine';
  coupon: Maybe<Coupon>;
  giftCard: Maybe<GiftCard>;
  id: Scalars['Int']['output'];
  name: Maybe<Scalars['String']['output']>;
  priceSubtotal: Maybe<Scalars['Float']['output']>;
  priceTax: Maybe<Scalars['Float']['output']>;
  priceTotal: Maybe<Scalars['Float']['output']>;
  priceUnit: Maybe<Scalars['Float']['output']>;
  product: Maybe<Product>;
  quantity: Maybe<Scalars['Float']['output']>;
  shopWarning: Maybe<Scalars['String']['output']>;
};

export type OrderList = Orders & {
  __typename?: 'OrderList';
  orders: Maybe<Array<Maybe<Order>>>;
  totalCount: Scalars['Int']['output'];
};

export type OrderSortInput = {
  dateOrder: InputMaybe<SortEnum>;
  id: InputMaybe<SortEnum>;
  name: InputMaybe<SortEnum>;
  state: InputMaybe<SortEnum>;
};

/** An enumeration. */
export enum OrderStage {
  Cancelled = 'Cancelled',
  Locked = 'Locked',
  Quotation = 'Quotation',
  QuotationSent = 'QuotationSent',
  SalesOrder = 'SalesOrder'
}

export type Orders = {
  orders: Maybe<Array<Maybe<Order>>>;
  totalCount: Scalars['Int']['output'];
};

export type PageRevision = {
  __typename?: 'PageRevision';
  author: Maybe<Scalars['String']['output']>;
  blocks: Maybe<Scalars['GenericScalar']['output']>;
  createdAt: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  isLive: Maybe<Scalars['Boolean']['output']>;
  number: Maybe<Scalars['Int']['output']>;
  restoredFrom: Maybe<Scalars['Int']['output']>;
};

export enum PageTypeEnum {
  Products = 'PRODUCTS',
  Static = 'STATIC'
}

export type Partner = {
  __typename?: 'Partner';
  addressType: Maybe<AddressType>;
  billingAddress: Maybe<Partner>;
  city: Maybe<Scalars['String']['output']>;
  company: Maybe<Partner>;
  companyName: Maybe<Scalars['String']['output']>;
  companyRegNo: Maybe<Scalars['String']['output']>;
  contacts: Maybe<Array<Partner>>;
  country: Maybe<Country>;
  currentPricelist: Maybe<Pricelist>;
  email: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image: Maybe<Scalars['String']['output']>;
  imageFilename: Maybe<Scalars['String']['output']>;
  imageUrl: Maybe<Scalars['String']['output']>;
  isCompany: Scalars['Boolean']['output'];
  isPublic: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  parentId: Maybe<Partner>;
  phone: Maybe<Scalars['String']['output']>;
  publicPricelist: Maybe<Pricelist>;
  shippingAddress: Maybe<Partner>;
  state: Maybe<State>;
  street: Maybe<Scalars['String']['output']>;
  street2: Maybe<Scalars['String']['output']>;
  vat: Maybe<Scalars['String']['output']>;
  zip: Maybe<Scalars['String']['output']>;
};

export type Payment = {
  __typename?: 'Payment';
  amount: Maybe<Scalars['Float']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  paymentReference: Maybe<Scalars['String']['output']>;
};

export type PaymentMethod = {
  __typename?: 'PaymentMethod';
  active: Maybe<Scalars['Boolean']['output']>;
  brands: Maybe<Array<PaymentMethod>>;
  code: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image: Maybe<Scalars['String']['output']>;
  imageFilename: Maybe<Scalars['String']['output']>;
  imagePaymentForm: Maybe<Scalars['String']['output']>;
  imageUrl: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  providers: Maybe<Array<PaymentProvider>>;
  sequence: Maybe<Scalars['Int']['output']>;
};

export type PaymentProvider = {
  __typename?: 'PaymentProvider';
  code: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Maybe<Scalars['String']['output']>;
  paymentMethods: Maybe<Array<PaymentMethod>>;
};

export type PaymentTransaction = {
  __typename?: 'PaymentTransaction';
  amount: Maybe<Scalars['Float']['output']>;
  company: Maybe<Partner>;
  currency: Maybe<Currency>;
  customer: Maybe<Partner>;
  id: Maybe<Scalars['Int']['output']>;
  payment: Maybe<Payment>;
  provider: Maybe<Scalars['String']['output']>;
  providerReference: Maybe<Scalars['String']['output']>;
  reference: Maybe<Scalars['String']['output']>;
  state: Maybe<PaymentTransactionState>;
};

/** An enumeration. */
export enum PaymentTransactionState {
  Authorized = 'Authorized',
  Canceled = 'Canceled',
  Confirmed = 'Confirmed',
  Draft = 'Draft',
  Error = 'Error',
  Pending = 'Pending'
}

export type Pricelist = {
  __typename?: 'Pricelist';
  currency: Maybe<Currency>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
};

export type Product = {
  __typename?: 'Product';
  accessoryProducts: Maybe<Array<Product>>;
  allowOutOfStock: Maybe<Scalars['Boolean']['output']>;
  alokaiPages: Maybe<Array<WebsitePage>>;
  alternativeProducts: Maybe<Array<Product>>;
  /** Specific to Product Template */
  attributeValues: Maybe<Array<AttributeValue>>;
  barcode: Maybe<Scalars['String']['output']>;
  breadcrumb: Maybe<Scalars['GenericScalar']['output']>;
  categories: Maybe<Array<Category>>;
  /** Specific to Product Template */
  combinationInfo: Maybe<Scalars['GenericScalar']['output']>;
  /** Specific to Product Variant */
  combinationInfoVariant: Maybe<Scalars['GenericScalar']['output']>;
  currency: Maybe<Currency>;
  description: Maybe<Scalars['String']['output']>;
  displayName: Maybe<Scalars['String']['output']>;
  /** Specific to use in Product Template */
  firstVariant: Maybe<Product>;
  frequentlyBoughtTogether: Maybe<Array<Product>>;
  id: Scalars['Int']['output'];
  image: Maybe<Scalars['String']['output']>;
  imageFilename: Maybe<Scalars['String']['output']>;
  imageUrl: Maybe<Scalars['String']['output']>;
  isInStock: Maybe<Scalars['Boolean']['output']>;
  isInWishlist: Maybe<Scalars['Boolean']['output']>;
  /** Specific to Product Variant */
  isVariantPossible: Maybe<Scalars['Boolean']['output']>;
  jsonLd: Maybe<Scalars['GenericScalar']['output']>;
  jsonLdBreadcrumb: Maybe<Scalars['GenericScalar']['output']>;
  mediaGallery: Maybe<Array<ProductImage>>;
  metaDescription: Maybe<Scalars['String']['output']>;
  metaImage: Maybe<Scalars['String']['output']>;
  metaKeyword: Maybe<Scalars['String']['output']>;
  metaTitle: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  outOfStockMessage: Maybe<Scalars['String']['output']>;
  /** Specific to Product Template */
  price: Maybe<Scalars['Float']['output']>;
  /** Specific to Product Variant */
  productTemplate: Maybe<Product>;
  /** Specific to Product Template */
  productVariants: Maybe<Array<Product>>;
  qty: Maybe<Scalars['Float']['output']>;
  /** Average customer rating (0-5) */
  ratingAvg: Maybe<Scalars['Float']['output']>;
  /** Total number of customer reviews */
  ratingCount: Maybe<Scalars['Int']['output']>;
  ribbon: Maybe<Ribbon>;
  showAvailableQty: Maybe<Scalars['Boolean']['output']>;
  sku: Maybe<Scalars['String']['output']>;
  slug: Maybe<Scalars['String']['output']>;
  smallImage: Maybe<Scalars['String']['output']>;
  status: Maybe<Scalars['Int']['output']>;
  tags: Maybe<Array<ProductTag>>;
  thumbnail: Maybe<Scalars['String']['output']>;
  typeId: Maybe<Scalars['String']['output']>;
  /** Specific to Product Variant */
  variantAttributeValues: Maybe<Array<AttributeValue>>;
  /** Specific to Product Variant */
  variantHasDiscountedPrice: Maybe<Scalars['Boolean']['output']>;
  /** Specific to Product Variant */
  variantPrice: Maybe<Scalars['Float']['output']>;
  /** Specific to Product Variant */
  variantPriceAfterDiscount: Maybe<Scalars['Float']['output']>;
  visibility: Maybe<Scalars['Int']['output']>;
  websiteDescription: Maybe<Scalars['String']['output']>;
  weight: Maybe<Scalars['Float']['output']>;
};

export type ProductFilterInput = {
  attribValues: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attributeValueId: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  categoryId: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  categorySlug: InputMaybe<Scalars['String']['input']>;
  ids: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  inStock: InputMaybe<Scalars['Boolean']['input']>;
  maxPrice: InputMaybe<Scalars['Float']['input']>;
  minPrice: InputMaybe<Scalars['Float']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
};

export type ProductImage = {
  __typename?: 'ProductImage';
  id: Scalars['Int']['output'];
  image: Maybe<Scalars['String']['output']>;
  imageFilename: Maybe<Scalars['String']['output']>;
  imageUrl: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  video: Maybe<Scalars['String']['output']>;
};

export type ProductInput = {
  id: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
};

export type ProductList = Products & {
  __typename?: 'ProductList';
  attributeValues: Maybe<Array<Maybe<AttributeValue>>>;
  filterCounts: Maybe<Scalars['GenericScalar']['output']>;
  maxPrice: Maybe<Scalars['Float']['output']>;
  minPrice: Maybe<Scalars['Float']['output']>;
  products: Maybe<Array<Maybe<Product>>>;
  searchUrl: Maybe<Scalars['String']['output']>;
  totalCount: Scalars['Int']['output'];
};

export type ProductSortInput = {
  id: InputMaybe<SortEnum>;
  name: InputMaybe<SortEnum>;
  newest: InputMaybe<SortEnum>;
  popular: InputMaybe<SortEnum>;
  price: InputMaybe<SortEnum>;
};

export type ProductTag = {
  __typename?: 'ProductTag';
  backgroundColor: Maybe<Scalars['String']['output']>;
  color: Maybe<Scalars['String']['output']>;
  image: Maybe<Scalars['String']['output']>;
  imageFilename: Maybe<Scalars['String']['output']>;
  imageUrl: Maybe<Scalars['String']['output']>;
  name: Maybe<Scalars['String']['output']>;
  visibleOnEcommerce: Maybe<Scalars['Boolean']['output']>;
};

export type ProductVariant = {
  displayImage: Maybe<Scalars['Boolean']['output']>;
  displayName: Maybe<Scalars['String']['output']>;
  hasDiscountedPrice: Maybe<Scalars['Boolean']['output']>;
  isCombinationPossible: Maybe<Scalars['Boolean']['output']>;
  listPrice: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['Float']['output']>;
  product: Maybe<Product>;
  productTemplateId: Maybe<Scalars['Int']['output']>;
};

export type ProductVariantData = ProductVariant & {
  __typename?: 'ProductVariantData';
  displayImage: Maybe<Scalars['Boolean']['output']>;
  displayName: Maybe<Scalars['String']['output']>;
  hasDiscountedPrice: Maybe<Scalars['Boolean']['output']>;
  isCombinationPossible: Maybe<Scalars['Boolean']['output']>;
  listPrice: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['Float']['output']>;
  product: Maybe<Product>;
  productTemplateId: Maybe<Scalars['Int']['output']>;
};

export type Products = {
  attributeValues: Maybe<Array<Maybe<AttributeValue>>>;
  filterCounts: Maybe<Scalars['GenericScalar']['output']>;
  maxPrice: Maybe<Scalars['Float']['output']>;
  minPrice: Maybe<Scalars['Float']['output']>;
  products: Maybe<Array<Maybe<Product>>>;
  searchUrl: Maybe<Scalars['String']['output']>;
  totalCount: Scalars['Int']['output'];
};

export type Query = {
  __typename?: 'Query';
  addresses: Maybe<Array<Partner>>;
  attribute: Attribute;
  blogPost: BlogPost;
  blogPosts: Maybe<BlogPosts>;
  blogTags: Maybe<BlogTags>;
  cart: Maybe<Cart>;
  categories: Maybe<Categories>;
  category: Maybe<Category>;
  /** Whether the current session may edit content. Asked of Odoo rather than inferred by the client - the storefront never decides this for itself. */
  cmsCanEdit: Maybe<Scalars['Boolean']['output']>;
  cmsCategories: Maybe<Array<Maybe<CmsRefOption>>>;
  /** Content languages, from the websites active languages. Not the same list as the storefront UI translations - a merchant may sell in more languages than the interface has been translated into. */
  cmsLocales: Maybe<Array<Maybe<CmsLocale>>>;
  /** Published page by URL. Public and cacheable. */
  cmsPage: Maybe<CmsPage>;
  /** A page including its draft. Requires the CMS Editor group. */
  cmsPageDraft: Maybe<CmsPage>;
  /** Page list for the studio. Requires the CMS Editor group. */
  cmsPages: Maybe<CmsPageList>;
  /** Product picker options. This is the capability a separate headless CMS could not provide without an id-sync job. */
  cmsProducts: Maybe<Array<Maybe<CmsRefOption>>>;
  /** Revision history. Requires the CMS Editor group. */
  cmsRevisions: Maybe<Array<Maybe<PageRevision>>>;
  countries: Maybe<Countries>;
  country: Country;
  deliveryMethods: Maybe<Array<ShippingMethod>>;
  invoice: Invoice;
  invoices: Maybe<Invoices>;
  mailingContacts: Maybe<MailingContacts>;
  mailingList: MailingList;
  mailingLists: Maybe<MailingLists>;
  order: Order;
  orders: Maybe<Orders>;
  partner: Partner;
  paymentConfirmation: Maybe<Cart>;
  paymentProvider: PaymentProvider;
  paymentProviders: Maybe<Array<PaymentProvider>>;
  paymentTransaction: PaymentTransaction;
  product: Maybe<Product>;
  productVariant: ProductVariant;
  products: Maybe<Products>;
  websiteFooter: Maybe<Array<WebsiteMenu>>;
  websiteHomepage: Maybe<Homepage>;
  websiteMegaMenu: Maybe<Array<WebsiteMenu>>;
  websiteMenu: Maybe<Array<WebsiteMenu>>;
  websitePage: Maybe<WebsitePage>;
  websitePages: Maybe<WebsitePages>;
  wishlistItems: Maybe<WishlistData>;
};


export type QueryAddressesArgs = {
  filter?: InputMaybe<AddressFilterInput>;
};


export type QueryAttributeArgs = {
  id: InputMaybe<Scalars['Int']['input']>;
};


export type QueryBlogPostArgs = {
  id: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryBlogPostsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<BlogPostFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<BlogPostSortInput>;
};


export type QueryCategoriesArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<CategoryFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<CategorySortInput>;
};


export type QueryCategoryArgs = {
  id: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCmsCategoriesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCmsPageArgs = {
  id: InputMaybe<Scalars['Int']['input']>;
  slug: InputMaybe<Scalars['String']['input']>;
};


export type QueryCmsPageDraftArgs = {
  id: Scalars['Int']['input'];
};


export type QueryCmsProductsArgs = {
  ids: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCmsRevisionsArgs = {
  pageId: Scalars['Int']['input'];
};


export type QueryCountriesArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<CountryFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<CountrySortInput>;
};


export type QueryCountryArgs = {
  code: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['Int']['input']>;
};


export type QueryInvoiceArgs = {
  id: InputMaybe<Scalars['Int']['input']>;
};


export type QueryInvoicesArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<InvoiceSortInput>;
};


export type QueryMailingContactsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<MailingContactFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<MailingContactSortInput>;
};


export type QueryMailingListArgs = {
  id: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMailingListsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<MailingListFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<MailingListSortInput>;
};


export type QueryOrderArgs = {
  id: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOrdersArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<OrderFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<OrderSortInput>;
};


export type QueryPaymentProviderArgs = {
  id: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPaymentTransactionArgs = {
  id?: InputMaybe<Scalars['Int']['input']>;
  reference?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductArgs = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductVariantArgs = {
  combinationId: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  productTemplateId: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProductsArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<ProductFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<ProductSortInput>;
};


export type QueryWebsiteFooterArgs = {
  noParent: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryWebsiteMegaMenuArgs = {
  noParent: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryWebsiteMenuArgs = {
  noParent: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryWebsitePageArgs = {
  id: InputMaybe<Scalars['Int']['input']>;
  pageSlug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWebsitePagesArgs = {
  currentPage?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<WebsitePageFilterInput>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<WebsitePageSortInput>;
};

export type Ribbon = {
  __typename?: 'Ribbon';
  bgColor: Maybe<Scalars['String']['output']>;
  displayName: Maybe<Scalars['String']['output']>;
  html: Maybe<Scalars['String']['output']>;
  htmlClass: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  textColor: Maybe<Scalars['String']['output']>;
};

export type SelectAddressInput = {
  id: Scalars['Int']['input'];
};

export type ShippingMethod = {
  __typename?: 'ShippingMethod';
  id: Scalars['Int']['output'];
  name: Maybe<Scalars['String']['output']>;
  price: Maybe<Scalars['Float']['output']>;
  product: Maybe<Product>;
};

export enum SortEnum {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type State = {
  __typename?: 'State';
  code: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type TwoFactorOutput = {
  __typename?: 'TwoFactorOutput';
  httponly: Maybe<Scalars['Boolean']['output']>;
  key: Maybe<Scalars['String']['output']>;
  maxAge: Maybe<Scalars['Int']['output']>;
  samesite: Maybe<Scalars['String']['output']>;
  user: Maybe<User>;
  value: Maybe<Scalars['String']['output']>;
};

export type UpdateAddressInput = {
  city: InputMaybe<Scalars['String']['input']>;
  countryId: InputMaybe<Scalars['Int']['input']>;
  email: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  name: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
  stateId: InputMaybe<Scalars['Int']['input']>;
  street: InputMaybe<Scalars['String']['input']>;
  street2: InputMaybe<Scalars['String']['input']>;
  zip: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMyAccountParams = {
  email: InputMaybe<Scalars['String']['input']>;
  id: InputMaybe<Scalars['Int']['input']>;
  name: InputMaybe<Scalars['String']['input']>;
  phone: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  partner: Maybe<Partner>;
  totpRequired: Maybe<Scalars['Boolean']['output']>;
};

/** An enumeration. */
export enum VariantCreateMode {
  Dynamically = 'Dynamically',
  Instantly = 'Instantly',
  NeverOption = 'NeverOption'
}

export type Website = {
  __typename?: 'Website';
  company: Maybe<Company>;
  id: Maybe<Scalars['Int']['output']>;
  name: Maybe<Scalars['String']['output']>;
  publicUser: Maybe<User>;
};

export type WebsiteMenu = {
  __typename?: 'WebsiteMenu';
  childs: Maybe<Array<WebsiteMenu>>;
  id: Scalars['Int']['output'];
  images: Maybe<Array<WebsiteMenuImage>>;
  isFooter: Maybe<Scalars['Boolean']['output']>;
  isMegaMenu: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  parent: Maybe<WebsiteMenu>;
  sequence: Maybe<Scalars['Int']['output']>;
  url: Maybe<Scalars['String']['output']>;
};

export type WebsiteMenuImage = {
  __typename?: 'WebsiteMenuImage';
  buttonText: Maybe<Scalars['String']['output']>;
  buttonUrl: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image: Maybe<Scalars['String']['output']>;
  imageFilename: Maybe<Scalars['String']['output']>;
  imageUrl: Maybe<Scalars['String']['output']>;
  sequence: Maybe<Scalars['Int']['output']>;
  subtitle: Maybe<Scalars['String']['output']>;
  tag: Maybe<Scalars['String']['output']>;
  textColor: Maybe<Scalars['String']['output']>;
  title: Maybe<Scalars['String']['output']>;
};

export type WebsitePage = {
  __typename?: 'WebsitePage';
  blocks: Maybe<Scalars['GenericScalar']['output']>;
  content: Maybe<Scalars['String']['output']>;
  id: Maybe<Scalars['Int']['output']>;
  isPublished: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  pageType: Maybe<PageTypeEnum>;
  publishingDate: Maybe<Scalars['String']['output']>;
  website: Maybe<Website>;
  websiteUrl: Maybe<Scalars['String']['output']>;
};

export type WebsitePageFilterInput = {
  id: InputMaybe<Array<InputMaybe<Scalars['Int']['input']>>>;
  pageSlug: InputMaybe<Scalars['String']['input']>;
  pageType: InputMaybe<Array<InputMaybe<PageTypeEnum>>>;
};

export type WebsitePageList = WebsitePages & {
  __typename?: 'WebsitePageList';
  totalCount: Scalars['Int']['output'];
  websitePages: Maybe<Array<Maybe<WebsitePage>>>;
};

export type WebsitePageSortInput = {
  id: InputMaybe<SortEnum>;
};

export type WebsitePages = {
  totalCount: Scalars['Int']['output'];
  websitePages: Maybe<Array<Maybe<WebsitePage>>>;
};

export type WishlistData = WishlistItems & {
  __typename?: 'WishlistData';
  totalCount: Scalars['Int']['output'];
  wishlistItems: Maybe<Array<Maybe<WishlistItem>>>;
};

export type WishlistItem = {
  __typename?: 'WishlistItem';
  id: Scalars['Int']['output'];
  partner: Maybe<Partner>;
  product: Maybe<Product>;
};

export type WishlistItems = {
  totalCount: Scalars['Int']['output'];
  wishlistItems: Maybe<Array<Maybe<WishlistItem>>>;
};
