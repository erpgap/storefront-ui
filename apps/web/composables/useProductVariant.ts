/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AttributeValue, Product, ProductVariantResponse, QueryProductVariantArgs } from '~/graphql';
import { QueryName } from '~/server/queries';

export const useProductVariant = (combinationId?: number, productTemplateId?: number) => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const productVariant = useState<Product>(`product-${combinationId}-${productTemplateId}`, () => ({} as Product));

  const loadProductVariant = async (params: QueryProductVariantArgs) => {
    loading.value = true;
    const { data } = await $sdk().odoo.query<QueryProductVariantArgs, ProductVariantResponse>({queryName: QueryName.GetProductVariantQuery}, params);
    loading.value = false;

    productVariant.value = data?.value.productVariant.product as Product;
  };

  const breadcrumbs = computed(() => {
    return [
      { name: 'Home', link: '/' },
      { name: 'Product'},
      { name: productVariant?.value?.name, link: `product/${productVariant?.value?.name}` },
    ];
  });

  const getImages = computed(() => {
    return [
      {
        imageSrc: productVariant?.value?.image,
        imageThumbSrc: productVariant?.value?.image,
        alt: productVariant.value?.name,
      },
    ];
  });

  const getAllSizes = computed(() => {
    return productVariant?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === 'Size')
      ?.map((item: AttributeValue) => ({
        value: item.id,
        label: item.name,
      }));
  });

  const getAllColors = computed(() => {
    return productVariant?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === 'Color')
      ?.map((item: AttributeValue) => ({
        value: item.id,
        label: item.name,
      }));
  });

  const getAllMaterials = computed(() => {
    return productVariant?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === 'Material')
      ?.map((item: AttributeValue) => ({
        value: item.id,
        label: item.name,
      }));
  });

  const getRegularPrice = computed(() => productVariant.value?.combinationInfoVariant?.list_price || 0);
  const getSpecialPrice = computed(() => productVariant.value?.combinationInfoVariant?.price || 0);

  return {
    loading,
    productVariant,
    getAllColors,
    getAllMaterials,
    getAllSizes,
    getImages,
    breadcrumbs,
    getRegularPrice,
    getSpecialPrice,

    loadProductVariant,
  };
};
