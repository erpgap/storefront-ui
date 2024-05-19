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
} from "./gql/graphql";
import type { H3Error } from "h3";
import type { _AsyncData } from "nuxt/dist/app/composables/asyncData";

export type CategoryListResponse = _AsyncData<
  {
    categories: {
      categories: Category[];
      totalCount: number;
    };
  },
  H3Error
>;

export type CategoryResponse = _AsyncData<
  {
    category: Category;
  },
  H3Error
>;

export type ProductTemplateListResponse = _AsyncData<
  {
    products: {
      attributeValues: AttributeValue[];
      maxPrice?: number;
      minPrice?: number;
      totalCount: number;
      products: Product[];
    };
  },
  H3Error
>;

export type ProductResponse = _AsyncData<
  {
    product: Product;
  },
  H3Error
>;

export type ProductVariantResponse = _AsyncData<
  {
    productVariant: ProductVariant;
  },
  H3Error
>;

export type WishlistLoadResponse = _AsyncData<
  {
    wishlistItems: WishlistData;
  },
  H3Error
>;

export type WishlistAddItemResponse = _AsyncData<
  {
    wishlistAddItem: WishlistData;
  },
  H3Error
>;

export type WishlistRemoveItemResponse = _AsyncData<
  {
    wishlistRemoveItem: WishlistData;
  },
  H3Error
>;

export type CartResponse = _AsyncData<
  {
    cart: Cart;
  },
  H3Error
>;

export type CartAddItemResponse = _AsyncData<
  {
    cartAddItem: Cart;
  },
  H3Error
>;
export type CartUpdateItemResponse = _AsyncData<
  {
    cartUpdateItem: Cart;
  },
  H3Error
>;

export type CartRemoveItemResponse = _AsyncData<
  {
    cartRemoveItem: Cart;
  },
  H3Error
>;

export type LoadUserQueryResponse = _AsyncData<
  {
    partner: Partner;
  },
  H3Error
>;

export type RegisterUserResponse = _AsyncData<
  {
    id: number;
    name: string;
    email: string;
    partner: Partner;
  },
  H3Error
>;

export type LoginUserResponse = _AsyncData<
  {
    login: {
      partner: Partner;
    };
  },
  H3Error
>;

export type ResetPasswordResponse = _AsyncData<
  {
    id: number;
    name: string;
    email: string;
  },
  H3Error
>;

export type PartnerResponse = _AsyncData<Partner, H3Error>;

export type AddressesResponse = _AsyncData<
  {
    addresses: Partner[];
  },
  H3Error
>;
export type AddAddressResponse = _AsyncData<
  {
    addAddress: Partner;
  },
  H3Error
>;

export type UpdatePasswordResponse = _AsyncData<
  {
    updatePassword: {
      id: number;
    };
  },
  H3Error
>;

export type UpdateMyAccountResponse = _AsyncData<
  {
    updateMyAccount: Partner;
  },
  H3Error
>;

export type CreateUpdatePartnerResponse = _AsyncData<
  {
    createUpdatePartner: Partner;
  },
  H3Error
>;

export type UpdateAddressResponse = _AsyncData<
  {
    updateAddress: Partner;
  },
  H3Error
>;

export type SelectCurrentAddressResponse = _AsyncData<
  {
    selectAddress: Partner;
  },
  H3Error
>;

export type DeleteAddressResponse = _AsyncData<
  {
    result: boolean;
  },
  H3Error
>;

export type CountryListResponse = _AsyncData<
  {
    countries: {
      countries: Country[];
      totalCount: number;
    };
  },
  H3Error
>;

export type DeliveryMethodListResponse = _AsyncData<
  {
    deliveryMethods: ShippingMethod[];
  },
  H3Error
>;

export type PaymentMethodListResponse = _AsyncData<
  {
    paymentProviders: PaymentProvider[];
  },
  H3Error
>;

export type AdyenTransactionResponse = _AsyncData<
  {
    adyenTransaction: AdyenTransactionResult;
  },
  H3Error
>;

export type AdyenProviderInfoResponse = _AsyncData<
  {
    adyenProviderInfo: AdyenProviderInfoResult;
  },
  H3Error
>;

export type AdyenPaymentMethodsResponse = _AsyncData<
  {
    adyenPaymentMethods: AdyenPaymentMethodsResult;
  },
  H3Error
>;

export type AdyenPaymentDetailsResponse = _AsyncData<
  {
    adyenPaymentDetails: AdyenPaymentDetailsResult;
  },
  H3Error
>;

export type AdyenPaymentsResponse = _AsyncData<
  {
    adyenPayments: AdyenPaymentsResult;
  },
  H3Error
>;
