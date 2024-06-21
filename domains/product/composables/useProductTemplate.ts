import type {
  AttributeValue,
  Product,
  ProductResponse,
  QueryProductArgs,
} from "~/graphql";
import { QueryName } from "~/server/queries";
import { useProductAttributes } from "./useProductAttributes";

const { getRegularPrice, getSpecialPrice } = useProductAttributes();
export const useProductTemplate = (slug: string) => {
  const { $sdk, $getImage } = useNuxtApp();

  const loadingProductTemplate = ref(false);
  const productTemplate = useState<Product>(
    `product-${slug}`,
    () => ({}) as Product
  );

  const images = computed(() => {
    return [
      {
        imageSrc: $getImage(
          String(productTemplate.value.image),
          300,
          400,
          String(productTemplate.value.name)
        ),
        imageThumbSrc: $getImage(
          String(productTemplate.value.image),
          300,
          400,
          String(productTemplate.value.name)
        ),
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
    const { data, error } = await $sdk().odoo.query<
      QueryProductArgs,
      ProductResponse
    >({ queryName: QueryName.GetProductTemplateQuery }, params);

    if (error.value) {
      showError({
        ...error.value,
        status: 404,
        message: "Product not found",
      });
      return;
    }

    loadingProductTemplate.value = false;

    productTemplate.value = (data?.value?.product as Product) || {};
  };

  const getAllSizes = computed(() => {
    return productTemplate?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === "Size")
      ?.map((item: AttributeValue) => ({
        value: item.id,
        label: item.name,
      }));
  });

  const getAllColors = computed(() => {
    return productTemplate?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === "Color")
      ?.map((item: AttributeValue) => ({
        value: item.id,
        label: item.name,
      }));
  });

  const getAllMaterials = computed(() => {
    return productTemplate?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === "Material")
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
