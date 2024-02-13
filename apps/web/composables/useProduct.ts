/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AttributeValue, Category, Product, ProductResponse, ProductTemplateListResponse, ProductVariant, ProductVariantData, QueryProductArgs, QueryProductVariantArgs, QueryProductsArgs } from '~/graphql';
import { QueryName } from '~/server/queries';
import { useProductAttributes } from './useProductAttributes';

const { getRegularPrice, getSpecialPrice } = useProductAttributes();
export const useProduct = (slug?: string) => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const productTemplate = useState<Product>(`product-${slug}`, () => ({} as Product));

  const withBase = (filepath: string | null) => `https://vsfdemo15.labs.odoogap.com${filepath}`;

  const images = computed(() => {
    return [
      {
        imageSrc: withBase(productTemplate?.value?.image),
        imageThumbSrc: withBase(productTemplate?.value?.image),
        alt: productTemplate?.value?.name,
      },
    ];
  });

  const specialPrice = computed(() => {
    if (!productTemplate.value.firstVariant) {
      return;
    }
    return getSpecialPrice(productTemplate?.value.firstVariant);
  });

  const regularPrice = computed(() => {
    if (!productTemplate.value.firstVariant) {
      return;
    }
    return getRegularPrice(productTemplate?.value.firstVariant);
  });

  const loadProductTemplate = async(params: QueryProductArgs) => {
    loading.value = true;
    const { data } = await $sdk().odoo.query<QueryProductArgs, ProductResponse>({queryName: QueryName.GetProductTemplate}, params);
    loading.value = false;

    productTemplate.value = data?.value.product as Product;
  };

  return {
    loading,
    loadProductTemplate,
    productTemplate,
    images,
    regularPrice,
    specialPrice
  };
};
