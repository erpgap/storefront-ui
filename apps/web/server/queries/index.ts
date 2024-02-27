import { DocumentNode } from 'graphql/language';
import LoadUserQuery from './LoadUserQuery';
import GetProductVariantQuery from './GetProductVariantQuery';
import StockLotsQuery from './StockLotsQuery';
import GetCategoriesQuery from './GetCategoriesQuery';
import GetCategoryQuery from './GetCategoryQuery';
import GetProductTemplateListQuery from './GetProductTemplateListQuery';
import GetProductTemplateQuery from './GetProductTemplateQuery';
import WishlistLoadQuery from './WishlistLoadQuery';
import LoadCartQuery from './LoadCartQuery';
import GetAddressesQuery from './GetAddressesQuery';
import GetCountriesQuery from './GetCountriesQuery';
import GetDeliveryMethodsQuery from './GetDeliveryMethodsQuery';
import GetPaymentMethodsQuery from './GetPaymentMethodsQuery';

enum QueryName {
  GetProductVariantQuery = 'GetProductVariantQuery',
  LoadUserQuery = 'LoadUserQuery',
  StockLotsQuery = 'StockLotsQuery',
  GetCategoriesQuery = 'GetCategoriesQuery',
  GetCategoryQuery = 'GetCategoryQuery',
  GetProductTemplateListQuery = 'GetProductTemplateListQuery',
  GetProductTemplateQuery = 'GetProductTemplateQuery',
  GetWishlist = 'GetWishlist',
  LoadCartQuery = 'LoadCartQuery',
  GetAddressesQuery = 'GetAddressesQuery',
  WishlistLoadQuery = 'WishlistLoadQuery',
  GetCountriesQuery = 'GetCountriesQuery',
  GetDeliveryMethodsQuery = 'GetDeliveryMethodsQuery',
  GetPaymentMethodsQuery = 'GetPaymentMethodsQuery',
}

const Queries: Record<QueryName, DocumentNode> = {
  GetProductVariantQuery,
  LoadUserQuery,
  StockLotsQuery,
  GetCategoriesQuery,
  GetCategoryQuery,
  GetProductTemplateListQuery,
  GetProductTemplateQuery,
  WishlistLoadQuery,
  LoadCartQuery,
  GetAddressesQuery,
  GetCountriesQuery,
  GetDeliveryMethodsQuery,
  GetPaymentMethodsQuery,
};

const QueriesToByPassCache: string[] = [QueryName.LoadUserQuery, QueryName.WishlistLoadQuery, QueryName.LoadCartQuery];

export { Queries, QueryName, QueriesToByPassCache };
