import type {
  CustomProductWithStockFromRedis,
  ProductVariantResponse,
  QueryProductVariantArgs,
} from '~/graphql'
import { QueryName } from '~/server/queries'

export const useProductVariant = (slugWithCombinationIds: string) => {
  const { $sdk } = useNuxtApp()

  const loadingProductVariant = ref(false)
  const productVariant = useState<CustomProductWithStockFromRedis>(
    `product-${slugWithCombinationIds}`,
    () => ({}) as CustomProductWithStockFromRedis,
  )

  const loadProductVariant = async (params: QueryProductVariantArgs) => {
    try {
      loadingProductVariant.value = true

      const { data, status } = await useAsyncData(
        `product-variant-${slugWithCombinationIds}`,
        () => $sdk().odoo.query<QueryProductVariantArgs, ProductVariantResponse>(
          { queryName: QueryName.GetProductVariantQuery },
          params,
        ),
      )

      await until(status).toBe('success')

      productVariant.value = (data?.value?.productVariant?.product) || {} as CustomProductWithStockFromRedis

      await nextTick()
    }
    catch (error) {
      console.error('Error loading product variant:', error)
    }
    finally {
      loadingProductVariant.value = false
    }
  }

  const getImages = computed(() => {
    return [
      {
        imageSrc: productVariant?.value?.image,
        imageThumbSrc: productVariant?.value?.image,
        alt: productVariant.value?.name,
      },
    ]
  })

  const getRegularPrice = computed(
    () =>
      productVariant.value?.combinationInfoVariant?.list_price
      || productVariant.value?.combinationInfo?.list_price
      || 0,
  )

  const getSpecialPrice = computed(
    () => productVariant.value?.combinationInfoVariant?.price || 0,
  )

  return {
    loadingProductVariant: readonly(loadingProductVariant),
    productVariant: readonly(productVariant),
    getImages,
    getRegularPrice,
    getSpecialPrice,
    loadProductVariant,
  }
}
