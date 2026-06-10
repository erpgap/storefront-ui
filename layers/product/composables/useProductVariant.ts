import type {
  Product,
  ProductVariantResponse,
  QueryProductVariantArgs,
} from '~~/graphql'
import { QueryName } from '~~/server/queries'

export const useProductVariant = (slug: string) => {
  const { $sdk } = useNuxtApp()

  const loadingProductVariant = ref(false)
  const productVariant = useState<Product>(`product-${slug}`, () => ({}) as Product)

  const loadProductVariant = async (params: QueryProductVariantArgs) => {
    try {
      loadingProductVariant.value = true
      const res = await $sdk().odoo.query<QueryProductVariantArgs, ProductVariantResponse>(
        { queryName: QueryName.GetProductVariantQuery },
        params,
      )

      productVariant.value = (res?.productVariant?.product || {}) as Product

      if (!productVariant.value?.id) {
        showError({ statusCode: 404, message: 'Product not found' })
      }
    }
    catch (error) {
      console.error('Error loading product variant:', error)
      showError({ statusCode: 500, message: 'Error loading product variant' })
    }
    finally {
      loadingProductVariant.value = false
    }
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
