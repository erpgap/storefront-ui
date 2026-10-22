import type {
  AttributeValue,
  Cart,
  Category,
  Partner,
  Product,
  WishlistData,
  Country,
  ShippingMethod,
  PaymentProvider,
  Orders,
  Order,
  Countries,
  User,
  ApplyCouponList,
  ApplyGiftCardList,
  OrderLine,
  Lead,
  Scalars,
} from './gql/graphql'

export interface BreadcrumbItem {
  label: string
  link: string
}

export type CategoryListResponse =
  {
    categories: {
      categories: Category[]
      totalCount: number
    }
  }

export type CategoryResponse = {
  category: Category
}

export type ProductTemplateListResponse = {
  products: {
    attributeValues: AttributeValue[]
    maxPrice?: number
    minPrice?: number
    totalCount: number
    filterCounts: any[]
    products: Product[]
  }
}

export type ProductResponse = {
  product: Product
}

export type ProductVariantResponse = {
  productVariant: {
    product: CustomProductWithStockFromRedis
  }
}

// What $sdk().odoo.query/mutation resolve to: the GraphQL `data` object itself.
export type WishlistLoadResponse = { wishlistItems: WishlistData }
export type WishlistAddItemResponse = { wishlistAddItem: WishlistData }
export type WishlistRemoveItemResponse = { wishlistRemoveItem: WishlistData }

export type CartResponse = {
  cart: Cart
}

export type CartAddItemResponse = { cartAddMultipleItems: Cart }

export type ApplyDiscountsResponse = {
  applyGiftCard: ApplyGiftCardList
  applyCoupon: ApplyCouponList
}
export type MakeGiftCardPaymentResponse = {
  makeGiftCardPayment: { done: boolean }
}
export type CartUpdateItemResponse = { cartUpdateMultipleItems: Cart }
export type CartRemoveItemResponse = { cartRemoveMultipleItems: Cart }

export type LoadUserQueryResponse = {
  partner: Partner
}

export type RegisterUserResponse = {
  id: number
  name: string
  email: string
  partner: Partner
}

export type SignUpUserResponse = {
  register: {
    id: number
    name: string
    email: string
    partner: Partner
  }
}

export type LoginUserResponse = {
  login: {
    user: User
  }
}

export type SignInUserResponse = {
  login: {
    user: User
  }
}

export type ResetPasswordResponse = {
  id: number
  name: string
  email: string
}

export type PartnerResponse = Partner

export type AddressesResponse = {
  addresses: Partner[]
}

export type responseAddresses = {
  addresses: Partner[]
}

export type AddAddressResponse = {
  addAddress: Partner
}

export type UpdatePasswordResponse = {
  updatePassword: {
    id: number
  }
}

export type ChangePasswordResponse = {
  changePassword: User
}

export type UpdateMyAccountResponse = {
  updateMyAccount: Partner
}

export type CreateUpdatePartnerResponse = {
  createUpdatePartner: Partner
}

export type UpdateAddressResponse = {
  updateAddress: Partner
}

export type SelectCurrentAddressResponse = {
  selectAddress: Partner
}

export type DeleteAddressResponse = {
  result: boolean
}

export type AddressFormFieldsInput = {
  street: string
  street2?: string
  countryId: number
  city: string
  stateId: number
  zip: string
}

export type AddressFormFieldsInputExtendedFields = AddressFormFieldsInput & {
  id?: number
  name: string
  phone: string
  email?: string
}

export type CountriesResponse = {
  countries: Countries
}

export type StatesResponse = {
  country: Country
}

export type DeliveryMethodListResponse = {
  deliveryMethods: ShippingMethod[]
}

export type DeliveryMethodResponse = {
  deliveryMethodId: number
}

export type WebsiteHomepageResponse =
  {
    metaTitle: string
    metaImage: string
    metaImageFilename: string
    metaKeyword: string
    metaDescription: string
    jsonLd: string
  }

export type PaymentMethodListResponse = {
  paymentProviders: PaymentProvider[]
}

export type AdyenTransactionResponse = {
  adyenTransaction: AdyenTransactionResult
}

export type AdyenProviderInfoResponse = {
  adyenProviderInfo: AdyenProviderInfoResult
}

export type AdyenPaymentMethodsResponse = {
  adyenPaymentMethods: AdyenPaymentMethodsResult
}

export type AdyenPaymentDetailsResponse = {
  adyenPaymentDetails: AdyenPaymentDetailsResult
}

export type AdyenPaymentsResponse = {
  adyenPayments: AdyenPaymentsResult
}

export type GetOrdersResponse = {
  orders: Orders
}

export type GetOrderResponse = {
  order: Order
}

export type NewsletterSubscribeResponse = {
  newsletterSubscribe: boolean
}

export type ContactUsResponse = {
  contactUs: Lead
}
export interface AttributeFacet {
  id: string
  label: string
  attributeName: string
  options: OrganizedAttribute[]
  open?: boolean
  type?: string
  size?: number
  search?: string
}
export interface OrganizedAttribute {
  id: string
  value: number
  label: string
  htmlColor: string
  total?: number
}

export type CustomProductWithStockFromRedis = Product & {
  stock: number
}

export type CustomOrderLineWithStockFromRedis = OrderLine & {
  product: CustomProductWithStockFromRedis
}

export type ImageGalleryItem = {
  id: number
  url: string
  alt: string
  width?: number | string
  height?: number | string
}

// ---------------------------------------------------------------------------
// Adyen (payment_adyen_alokai)
// ---------------------------------------------------------------------------
// gql/graphql.ts is generated from an Odoo without that addon installed, so
// its mutations are declared here, from
// payment_adyen_alokai/graphql/payment_adyen.py. Every result is a
// GenericScalar: Adyen's own JSON, passed through.

type AdyenJson = Scalars['GenericScalar']['output']

export interface AdyenProviderInfoResult { adyenProviderInfo: AdyenJson | null }
export interface AdyenPaymentMethodsResult { adyenPaymentMethods: AdyenJson | null }
export interface AdyenTransactionResult { transaction: AdyenJson | null }
export interface AdyenPaymentsResult { adyenPayments: AdyenJson | null }
export interface AdyenPaymentDetailsResult { adyenPaymentDetails: AdyenJson | null }

export interface MutationAdyenProviderInfoArgs { providerId: number }
export interface MutationAdyenPaymentMethodsArgs { providerId: number }
export interface MutationAdyenTransactionArgs { providerId: number, tokenizationRequested?: boolean }
export interface MutationAdyenPaymentsArgs {
  providerId: number
  transactionReference: string
  accessToken: string
  paymentMethod: AdyenJson
  browserInfo: AdyenJson
}
export interface MutationAdyenPaymentDetailsArgs {
  providerId: number
  transactionReference: string
  paymentDetails: AdyenJson
}
