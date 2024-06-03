import type {
  Product,
  ProductVariantResponse,
  QueryProductVariantArgs,
} from "~/graphql";
import { QueryName } from "~/server/queries";

export const useProductVariant = (slugWithCombinationIds: string) => {
  const { $sdk } = useNuxtApp();

  const loadingProductVariant = ref(false);
  const productVariant = useState<Product>(
    `product-${slugWithCombinationIds}`,
    () => ({}) as Product
  );

  const loadProductVariant = async (params: QueryProductVariantArgs) => {
    if (productVariant.value?.id) return;

    loadingProductVariant.value = true;
    const { data, error } = await $sdk().odoo.query<
      QueryProductVariantArgs,
      ProductVariantResponse
    >({ queryName: QueryName.GetProductVariantQuery }, params);
    loadingProductVariant.value = false;

    if (error.value) {
      showError({
        ...error.value,
        status: 404,
        message: "Product not found",
      });
      return;
    }

    productVariant.value = data?.value?.productVariant.product as Product;
  };

  const categoriesForBreadcrumb = computed(() => {
    return (
      productVariant.value?.categories
        ?.filter((category) => category.name !== "All")
        ?.map((item) => ({ name: item.name, link: item.slug }))
        ?.flat() || []
    );
  });

  const breadcrumbs = computed(() => {
    return [
      { name: "Home", link: "/" },
      ...categoriesForBreadcrumb.value,
      {
        name: productVariant?.value?.name,
        link: `product/${productVariant?.value?.name}`,
      },
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

  const getRegularPrice = computed(
    () => productVariant.value?.combinationInfoVariant?.list_price || 0
  );
  const getSpecialPrice = computed(
    () => productVariant.value?.combinationInfoVariant?.price || 0
  );

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
