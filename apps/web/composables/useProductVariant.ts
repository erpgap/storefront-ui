/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AttributeValue, Product, ProductVariantResponse, QueryProductVariantArgs } from '~/graphql';
import { QueryName } from '~/server/queries';

export const useProductVariant = (slugWithCombinationIds: string) => {
  const { $sdk } = useNuxtApp();

  const loadingProductVariant = ref(false);
  const productVariant = useState<Product>(`product-${slugWithCombinationIds}`, () => ({} as Product));

  const loadProductVariant = async (params: QueryProductVariantArgs) => {
    // await clearNuxtState();
    // if (productVariant.value?.id) return;

    loadingProductVariant.value = true;
    const { data } = await $sdk().odoo.query<QueryProductVariantArgs, ProductVariantResponse>({queryName: QueryName.GetProductVariantQuery}, params);
    loadingProductVariant.value = false;

    productVariant.value = data?.value?.productVariant.product as Product;
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

  const getRegularPrice = computed(() => productVariant.value?.combinationInfoVariant?.list_price || 0);
  const getSpecialPrice = computed(() => productVariant.value?.combinationInfoVariant?.price || 0);

  return {
    loadingProductVariant,
    productVariant,
    getImages,
    breadcrumbs,
    getRegularPrice,
    getSpecialPrice,

    loadProductVariant,
  };
};
