import type {
  CustomProductWithStockFromRedis,
  Product,
  ProductVariant,
  ProductVariantResponse,
  QueryProductVariantArgs,
} from '~/graphql'
import { QueryName } from '~/server/queries'

export const useProductVariant = (slugWithCombinationIds: string) => {
  const { $sdk } = useNuxtApp()

  const loadingProductVariant = ref(false)
  const productVariant = useState<CustomProductWithStockFromRedis>(`product-${slugWithCombinationIds}`, () => ({}) as CustomProductWithStockFromRedis)

  const loadProductVariant = async (params: QueryProductVariantArgs) => {
    const { data, status } = await useAsyncData(() =>
      $sdk().odoo.query<QueryProductVariantArgs, ProductVariantResponse>(
        { queryName: QueryName.GetProductVariantQuery }, params),
    )

    productVariant.value = (data?.value?.productVariant?.product) || {} as CustomProductWithStockFromRedis
    if (!productVariant.value?.id) {
      showError({
        status: 404,
        message: 'Product not found',
      })
    }

    watch(status, () => {
      if (status.value === 'error' && !data?.value) {
        showError({
          status: 404,
          message: 'Product not found',
        })
      }
      if (status.value === 'pending') {
        loadingProductVariant.value = true
      }
      if (status.value === 'success') {
        loadingProductVariant.value = false
      }
    })
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
    loadingProductVariant,
    productVariant: computed(() => productVariant.value),
    getImages,
    getRegularPrice,
    getSpecialPrice,

    loadProductVariant,
  }
}
