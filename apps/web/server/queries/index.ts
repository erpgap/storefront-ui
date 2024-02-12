import { DocumentNode } from 'graphql/language';
import LoadUserQuery from './LoadUserQuery';
import ProductVariantQuery from './ProductVariantQuery';
import StockLotsQuery from './StockLotsQuery';
import GetCategories from './GetCategories';
import GetCategory from './GetCategory';
import GetProductTemplateList from './GetProductTemplateList';
import GetProduct from './GetProduct';
import WishlistLoadQuery from './WishlistLoadQuery';
import LoadCart from './LoadCart';
import GetAddresses from './GetAddresses';
import GetCountries from './GetCountries';
import GetCountryState from './GetCountryState';

enum QueryName {
  ProductVariantQuery = 'ProductVariantQuery',
  LoadUserQuery = 'LoadUserQuery',
  StockLotsQuery = 'StockLotsQuery',
  GetCategories = 'GetCategories',
  GetCategory = 'GetCategory',
  GetProductTemplateList = 'GetProductTemplateList',
  GetProduct = 'GetProduct',
  GetWishlist = 'GetWishlist',
  LoadCart = 'LoadCart',
  GetAddresses = 'GetAddresses',
  GetCountries = 'GetCountries',
  GetCountryState = 'GetCountryState',
  WishlistLoadQuery = 'WishlistLoadQuery'
}

const Queries: Record<QueryName, DocumentNode> = {
  ProductVariantQuery,
  LoadUserQuery,
  StockLotsQuery,
  GetCategories,
  GetCategory,
  GetProductTemplateList,
  GetProduct,
  WishlistLoadQuery,
  LoadCart,
  GetAddresses,
  GetCountries,
  GetCountryState
};

export { Queries, QueryName };
