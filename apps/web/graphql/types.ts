import { H3Error } from 'h3';
import { AttributeValue, Cart, Categories, Category, Product, Products } from './gql/graphql';
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
