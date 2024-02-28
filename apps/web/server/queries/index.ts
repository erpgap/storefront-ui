import { DocumentNode } from 'graphql/language';
import LoadUserQuery from './LoadUserQuery';
import GetProductVariantQuery from './GetProductVariantQuery';
import StockLotsQuery from './StockLotsQuery';
import GetCategories from './GetCategories';
import GetCategory from './GetCategory';
import GetProductTemplateList from './GetProductTemplateList';
import GetProductTemplate from './GetProductTemplate';
import WishlistLoadQuery from './WishlistLoadQuery';
import LoadCart from './LoadCart';
import GetAddresses from './GetAddresses';
import GetCountries from './GetCountries';
import GetDeliveryMethods from './GetDeliveryMethods';
import GetPaymentMethods from './GetPaymentMethods';
import GetPaymentConfirmation from './GetPaymentConfirmation';

enum QueryName {
  GetProductVariantQuery = 'GetProductVariantQuery',
  LoadUserQuery = 'LoadUserQuery',
  StockLotsQuery = 'StockLotsQuery',
  GetCategories = 'GetCategories',
  GetCategory = 'GetCategory',
  GetProductTemplateList = 'GetProductTemplateList',
  GetProductTemplate = 'GetProductTemplate',
  GetWishlist = 'GetWishlist',
  LoadCart = 'LoadCart',
  GetAddresses = 'GetAddresses',
  WishlistLoadQuery = 'WishlistLoadQuery',
  GetCountries = 'GetCountries',
  GetDeliveryMethods = 'GetDeliveryMethods',
  GetPaymentMethods = 'GetPaymentMethods',
  GetPaymentConfirmation = 'GetPaymentConfirmation'
}

const Queries: Record<QueryName, DocumentNode> = {
  GetProductVariantQuery,
  LoadUserQuery,
  StockLotsQuery,
  GetCategories,
  GetCategory,
  GetProductTemplateList,
  GetProductTemplate,
  WishlistLoadQuery,
  LoadCart,
  GetAddresses,
  GetCountries,
  GetDeliveryMethods,
  GetPaymentMethods,
  GetPaymentConfirmation
};

export { Queries, QueryName };
