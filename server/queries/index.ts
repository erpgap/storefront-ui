import GetAddressesQuery from './GetAddressesQuery';
import GetCategoriesQuery from './GetCategoriesQuery';
import GetCategoryQuery from './GetCategoryQuery';
import GetCountriesQuery from './GetCountriesQuery';
import GetStatesQuery from './GetStatesQuery';
import GetDeliveryMethodsQuery from './GetDeliveryMethodsQuery';
import GetPaymentConfirmation from './GetPaymentConfirmation';
import GetPaymentMethodsQuery from './GetPaymentMethodsQuery';
import GetProductTemplateListQuery from './GetProductTemplateListQuery';
import GetProductTemplateQuery from './GetProductTemplateQuery';
import GetProductVariantQuery from './GetProductVariantQuery';
import GetOrdersQuery from './GetOrdersQuery';
import GetOrderQuery from './GetOrderQuery';
import LoadCartQuery from './LoadCartQuery';
import LoadUserQuery from './LoadUserQuery';
import StockLotsQuery from './StockLotsQuery';
import WishlistLoadQuery from './WishlistLoadQuery';
import GetWebsiteHomepageQuery from './GetWebsiteHomepageQuery';
import type { DocumentNode } from 'graphql/language';

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
  GetStates = 'GetStatesQuery',
  GetDeliveryMethodsQuery = 'GetDeliveryMethodsQuery',
  GetPaymentMethodsQuery = 'GetPaymentMethodsQuery',
  GetPaymentConfirmation = 'GetPaymentConfirmation',
  GetOrdersQuery = 'GetOrdersQuery',
  GetOrderQuery = 'GetOrderQuery',
  GetWebsiteHomepageQuery = 'GetWebsiteHomepageQuery',
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
  GetPaymentConfirmation,
  GetOrdersQuery,
  GetOrderQuery,
  GetStatesQuery,
  GetWebsiteHomepageQuery,
};

const QueriesToByPassCache: string[] = [
  QueryName.LoadUserQuery,
  QueryName.WishlistLoadQuery,
  QueryName.LoadCartQuery,
];

export { Queries, QueryName, QueriesToByPassCache };
