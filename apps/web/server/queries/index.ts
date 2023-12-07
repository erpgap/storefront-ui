import LoadUserQuery from './LoadUserQuery';
import ProductVariantQuery from './ProductVariantQuery';
import StockLotsQuery from './StockLotsQuery';
import GetCategories from './GetCategories';
import GetCategory from './GetCategory';
import GetProductTemplateList from './GetProductTemplateList';
import GetProduct from './GetProduct';

enum QueryName {
  ProductVariantQuery = 'ProductVariantQuery',
  LoadUserQuery = 'LoadUserQuery',
  StockLotsQuery = 'StockLotsQuery',
  GetCategories = 'GetCategories',
  GetCategory = 'GetCategory',
  GetProductTemplateList = 'GetProductTemplateList',
  GetProduct = 'GetProduct'
}

const Queries: Record<QueryName, DocumentNode> = {
  ProductVariantQuery,
  LoadUserQuery,
  StockLotsQuery,
  GetCategories,
  GetCategory,
  GetProductTemplateList,
  GetProduct
};

export { Queries, QueryName };
