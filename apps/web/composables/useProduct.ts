/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AttributeValue, Category, Product, ProductResponse, ProductTemplateListResponse, ProductVariant, ProductVariantData, QueryProductArgs, QueryProductVariantArgs, QueryProductsArgs } from '~/graphql';
import { QueryName } from '~/server/queries';
import { uniqBy } from 'lodash';
export const useProduct = (slug?: string) => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const product = useState<Product>(`product-${slug}`, () => ({} as Product));

  const loadProduct = async (params: QueryProductArgs) => {
    loading.value = true;
    const { data } = await $sdk().odoo.query<QueryProductArgs, ProductResponse>({queryName: QueryName.GetProduct}, params);
    loading.value = false;

    product.value = data?.value.product;
  };

  return {
    loading,
    loadProduct,
    product,
  };
};
