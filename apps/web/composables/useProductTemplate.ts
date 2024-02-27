/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AttributeValue, Product, ProductResponse, QueryProductArgs } from '~/graphql';
import { QueryName } from '~/server/queries';
import { useProductAttributes } from './useProductAttributes';

const { getRegularPrice, getSpecialPrice } = useProductAttributes();
export const useProductTemplate = (slug?: string) => {
  const { $sdk } = useNuxtApp();

  const loadingProductTemplate = ref(false);
  const productTemplate = useState<Product>(`product-${slug}`, () => ({}) as Product);

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
    if (!productTemplate.value?.firstVariant) {
      return;
    }
    return getSpecialPrice(productTemplate.value?.firstVariant);
  });

  const regularPrice = computed(() => {
    if (!productTemplate.value?.firstVariant) {
      return;
    }
    return getRegularPrice(productTemplate.value?.firstVariant);
  });

  const loadProductTemplate = async (params: QueryProductArgs) => {
    if (productTemplate.value?.id) {
      return;
    }
    loadingProductTemplate.value = true;
    const { data } = await $sdk().odoo.query<QueryProductArgs, ProductResponse>(
      { queryName: QueryName.GetProductTemplateQuery },
      params,
    );

    loadingProductTemplate.value = false;

    productTemplate.value = (data?.value?.product as Product) || {};
  };

  const getAllSizes = computed(() => {
    return productTemplate?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === 'Size')
      ?.map((item: AttributeValue) => ({
        value: item.id,
        label: item.name,
      }));
  });

  const getAllColors = computed(() => {
    return productTemplate?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === 'Color')
      ?.map((item: AttributeValue) => ({
        value: item.id,
        label: item.name,
      }));
  });

  const getAllMaterials = computed(() => {
    return productTemplate?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === 'Material')
      ?.map((item: AttributeValue) => ({
        value: item.id,
        label: item.name,
      }));
  });

  return {
    loadingProductTemplate,
    loadProductTemplate,
    productTemplate,
    images,
    regularPrice,
    specialPrice,
    getAllColors,
    getAllMaterials,
    getAllSizes,
  };
};
