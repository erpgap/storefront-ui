import type { H3Error } from 'h3'
import type {
  AttributeValue,
  Cart,
  Category,
  Partner,
  Product,
  ProductVariant,
  WishlistData,
  Country,
  ShippingMethod,
  AdyenTransactionResult,
  AdyenProviderInfoResult,
  AdyenPaymentMethodsResult,
  AdyenPaymentDetailsResult,
  AdyenPaymentsResult,
  PaymentProvider,
  Orders,
  Order,
  Countries,
  AddressEnum,
  State,
  User,
} from './gql/graphql'
import type { AsyncData } from '#app'

export type CategoryListResponse = AsyncData<
  {
    categories: {
      categories: Category[]
      totalCount: number
    }
  },
  H3Error
>

export type CategoryResponse = AsyncData<
  {
    category: Category
  },
  H3Error
>

export type ProductTemplateListResponse = AsyncData<
  {
    products: {
      attributeValues: AttributeValue[]
      maxPrice?: number
      minPrice?: number
      totalCount: number
      filterCounts: any[]
      products: Product[]
    }
  },
  H3Error
>

export type ProductResponse = AsyncData<
  {
    product: Product
  },
  H3Error
>

export type ProductVariantResponse = AsyncData<
  {
    productVariant: ProductVariant
  },
  H3Error
>

export type WishlistLoadResponse = AsyncData<
  {
    wishlistItems: WishlistData
  },
  H3Error
>

export type WishlistAddItemResponse = AsyncData<
  {
    wishlistAddItem: WishlistData
  },
  H3Error
>

export type WishlistRemoveItemResponse = AsyncData<
  {
    wishlistRemoveItem: WishlistData
  },
  H3Error
>

export type CartResponse = AsyncData<
  {
    cart: Cart
  },
  H3Error
>

export type CartAddItemResponse = AsyncData<
  {
    cartAddMultipleItems: Cart
  },
  H3Error
>
export type ApplyDiscountsResponse = AsyncData<
  {
    order: Order
    error: string
  },
  H3Error
>
export type MakeGiftCardPaymentResponse = AsyncData<
  {
    makeGiftCardPayment: { done: boolean }
  },
  H3Error
>
export type CartUpdateItemResponse = AsyncData<
  {
    cartUpdateMultipleItems: Cart
  },
  H3Error
>

export type CartRemoveItemResponse = AsyncData<
  {
    cartRemoveMultipleItems: Cart
  },
  H3Error
>

export type LoadUserQueryResponse = AsyncData<
  {
    partner: Partner
  },
  H3Error
>

export type RegisterUserResponse = AsyncData<
  {
    id: number
    name: string
    email: string
    partner: Partner
  },
  H3Error
>

export type LoginUserResponse = AsyncData<
  {
    login: {
      partner: Partner
    }
  },
  H3Error
>

export type ResetPasswordResponse = AsyncData<
  {
    id: number
    name: string
    email: string
  },
  H3Error
>

export type PartnerResponse = AsyncData<Partner, H3Error>

export type AddressesResponse = AsyncData<
  {
    addresses: Partner[]
  },
  H3Error
>
export type AddAddressResponse = AsyncData<
  {
    addAddress: Partner
  },
  H3Error
>

export type UpdatePasswordResponse = AsyncData<
  {
    updatePassword: {
      id: number
    }
  },
  H3Error
>

export type ChangePasswordResponse = AsyncData<
  {
    changePassword: User
  },
  H3Error
>

export type UpdateMyAccountResponse = AsyncData<
  {
    updateMyAccount: Partner
  },
  H3Error
>

export type CreateUpdatePartnerResponse = AsyncData<
  {
    createUpdatePartner: Partner
  },
  H3Error
>

export type UpdateAddressResponse = AsyncData<
  {
    updateAddress: Partner
  },
  H3Error
>

export type SelectCurrentAddressResponse = AsyncData<
  {
    selectAddress: Partner
  },
  H3Error
>

export type DeleteAddressResponse = AsyncData<
  {
    result: boolean
  },
  H3Error
>

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

export type CountriesResponse = AsyncData<
  {
    countries: Countries
  },
  H3Error
>

export type StatesResponse = AsyncData<
  {
    country: Country
  },
  H3Error
>

export type DeliveryMethodListResponse = AsyncData<
  {
    deliveryMethods: ShippingMethod[]
  },
  H3Error
>

export type DeliveryMethodResponse = AsyncData<
  {
    deliveryMethodId: number
  },
  H3Error
>

export type WebsiteHomepageResponse = AsyncData<
  {
    metaTitle: string
    metaImage: string
    metaImageFilename: string
    metaKeyword: string
    metaDescription: string
    jsonLd: string
  },
  H3Error
>

export type PaymentMethodListResponse = AsyncData<
  {
    paymentProviders: PaymentProvider[]
  },
  H3Error
>

export type AdyenTransactionResponse = AsyncData<
  {
    adyenTransaction: AdyenTransactionResult
  },
  H3Error
>

export type AdyenProviderInfoResponse = AsyncData<
  {
    adyenProviderInfo: AdyenProviderInfoResult
  },
  H3Error
>

export type AdyenPaymentMethodsResponse = AsyncData<
  {
    adyenPaymentMethods: AdyenPaymentMethodsResult
  },
  H3Error
>

export type AdyenPaymentDetailsResponse = AsyncData<
  {
    adyenPaymentDetails: AdyenPaymentDetailsResult
  },
  H3Error
>

export type AdyenPaymentsResponse = AsyncData<
  {
    adyenPayments: AdyenPaymentsResult
  },
  H3Error
>

export type GetOrdersResponse = AsyncData<
  {
    orders: Orders
  },
  H3Error
>

export type GetOrderResponse = AsyncData<
  {
    order: Order
  },
  H3Error
>

export type NewsletterSubscribeResponse = AsyncData<
  {
    newsletterSubscribe: boolean
  },
  H3Error
>
