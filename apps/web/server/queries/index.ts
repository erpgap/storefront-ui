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
import GetCountryState from './GetCountryState';

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
  GetCountries = 'GetCountries',
  GetCountryState = 'GetCountryState',
  WishlistLoadQuery = 'WishlistLoadQuery'
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
  GetCountryState
};

export { Queries, QueryName };
