import type {
  Product,
  ProductVariantResponse,
  QueryProductVariantArgs,
} from '~~/graphql'
import { QueryName } from '~~/server/queries'

export const useProductVariant = (slug: string) => {
  const { $sdk } = useNuxtApp()

  const productVariant = useState<Product>(`product-${slug}`, () => ({}) as Product)

  const variantParams = ref<QueryProductVariantArgs | null>(null)

  const { data, status, error, refresh } = useAsyncData<ProductVariantResponse>(
    `product-variant-${slug}`,
    () =>
      $sdk().odoo.query<QueryProductVariantArgs, ProductVariantResponse>(
        { queryName: QueryName.GetProductVariantQuery },
        variantParams.value as QueryProductVariantArgs,
        { headers: useRequestHeaders() },
      ),
    { immediate: false },
  )

  const loadingProductVariant = computed(() => status.value === 'pending')

  const setVariant = () => {
    productVariant.value = (data.value?.productVariant?.product || {}) as Product
    if (!productVariant.value?.id) {
      showError({ statusCode: 404, message: 'Product not found' })
    }
  }

  watch(data, () => {
    if (data.value) setVariant()
  })
  watch(error, (err: unknown) => {
    if (err) showError({ statusCode: 500, message: 'Error loading product variant' })
  })

  const loadProductVariant = async (params: QueryProductVariantArgs) => {
    variantParams.value = params
    await refresh()
    if (data.value) setVariant()
  }

  const categoriesForBreadcrumb = computed(() =>
    productVariant.value?.categories
      ?.filter((category: { name: string }) => category.name !== 'All')
      ?.map((item: { name: any; slug: any }) => ({ name: item.name, link: item.slug }))
    ?? [],
  )

  const breadcrumbs = computed(() => [
    { name: 'Home', link: '/' },
    ...categoriesForBreadcrumb.value,
    {
      name: productVariant.value?.name,
      link: `product/${productVariant.value?.name}`,
    },
  ])

  const getImages = computed(() => [
    {
      imageSrc: productVariant.value?.imageUrl,
      imageThumbSrc: productVariant.value?.imageUrl,
      alt: productVariant.value?.name,
    },
  ])

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
    breadcrumbs,
  }
}
