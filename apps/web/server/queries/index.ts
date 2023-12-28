import LoadUserQuery from './LoadUserQuery';
import ProductVariantQuery from './ProductVariantQuery';
import StockLotsQuery from './StockLotsQuery';
import GetCategories from './GetCategories';
import GetCategory from './GetCategory';
import GetProductTemplateList from './GetProductTemplateList';
import GetProduct from './GetProduct';
import GetWishlist from './GetWishlist';
import LoadCart from './LoadCart';
import { DocumentNode } from 'graphql/language';

enum QueryName {
  ProductVariantQuery = 'ProductVariantQuery',
  LoadUserQuery = 'LoadUserQuery',
  StockLotsQuery = 'StockLotsQuery',
  GetCategories = 'GetCategories',
  GetCategory = 'GetCategory',
  GetProductTemplateList = 'GetProductTemplateList',
  GetProduct = 'GetProduct',
  GetWishlist = 'GetWishlist',
  LoadCart = 'LoadCart'
}

const Queries: Record<QueryName, DocumentNode> = {
  ProductVariantQuery,
  LoadUserQuery,
  StockLotsQuery,
  GetCategories,
  GetCategory,
  GetProductTemplateList,
  GetProduct,
  GetWishlist,
  LoadCart
};

export { Queries, QueryName };
