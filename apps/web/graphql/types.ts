import { H3Error } from 'h3';
import { AttributeValue, Cart, Categories, Category, CountryList, Partner, Product, Products } from './gql/graphql';
import { _AsyncData } from 'nuxt/dist/app/composables/asyncData';

export type CategoryListResponse = _AsyncData<
  {
    categories: {
      categories: Category[];
      totalCount: number;
    }
  },
  H3Error
>;

export type CategoryResponse = _AsyncData<
  {
    category: Category
  },
  H3Error
>;

export type ProductTemplateListResponse = _AsyncData<
  {
    products:{
      attributeValues: AttributeValue[];
      maxPrice?: number;
      minPrice?: number;
      totalCount: number;
      products: Product[]
    }
  },
  H3Error
>;

export type ProductResponse = _AsyncData<
  {
    product: Product
  },
  H3Error
>;

export type ProductVariantResponse = _AsyncData<
  {
    product: Product;
    productTemplateId: string;
    displayName: string;
    price: number;
    listPrice: string;
    hasDiscountedPrice: boolean;
  },
  H3Error
>;

export type WishlistResponse = _AsyncData<
  {
    totalCount: number;
    product: Product;
  },
  H3Error
>;

export type CartResponse = _AsyncData<
  {
    cart: Cart
  },
  H3Error
>;

export type CartUpdateItemResponse = _AsyncData<
  {
    cartUpdateItem: Cart
  },
  H3Error
>;

export type CartRemoveItemResponse = _AsyncData<
  {
    cartRemoveItem: Cart
  },
  H3Error
>;

export type LoadUserQueryResponse = _AsyncData<
  {
    partner: Partner
  },
  H3Error
>;

export type RegisterUserResponse = _AsyncData<
  {
    id: number,
    name: string,
    email: string,
    partner: Partner
  },
  H3Error
>;

export type LoginUserResponse = _AsyncData<
  {
    partner: Partner
  },
  H3Error
>;

export type ResetPasswordResponse = _AsyncData<
  {
    id: number,
    name: string,
    email: string,
  },
  H3Error
>;

export type PartnerResponse = _AsyncData<
  Partner,
  H3Error
>;

export type AddressesResponse = _AsyncData<
  {
    addresses: Partner[],
  },
  H3Error
>;

export type CountryListResponse = _AsyncData<
  {
    countries: CountryList
  },
  H3Error
>;

export type CountryStatesResponse = _AsyncData<
  {
    states: {
      id: number,
      name: string,
      code: string,
    }
  },
  H3Error
>;
