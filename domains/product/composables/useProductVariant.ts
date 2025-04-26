import type {
  Product,
  ProductVariant,
  ProductVariantResponse,
  QueryProductVariantArgs,
} from '~/graphql'
import { QueryName } from '~/server/queries'

export const useProductVariant = (slugWithCombinationIds: string) => {
  const { $sdk } = useNuxtApp()

  const loadingProductVariant = ref(false)
  const productVariant = useState<Product>(`product-${slugWithCombinationIds}`, () => ({}) as Product)

  const loadProductVariant = async (params: QueryProductVariantArgs) => {
    if (productVariant.value?.id) return

    console.log(params)

    const { data, status } = await useAsyncData(() =>
      $sdk().odoo.query<QueryProductVariantArgs, ProductVariantResponse>(
        { queryName: QueryName.GetProductVariantQuery }, params),
    )

    productVariant.value = (data?.value?.productVariant?.product) || {} as Product
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

  const categoriesForBreadcrumb = computed(() => {
    return (
      productVariant.value?.categories
        ?.filter(category => category.name !== 'All')
        ?.map(item => ({ name: item.name, link: item.slug }))
        ?.flat() || []
    )
  })

  const breadcrumbs = computed(() => {
    return [
      { name: 'Home', link: '/' },
      ...categoriesForBreadcrumb.value,
      {
        name: productVariant?.value?.name,
        link: `product/${productVariant?.value?.name}`,
      },
    ]
  })

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
    breadcrumbs,
    getRegularPrice,
    getSpecialPrice,

    loadProductVariant,
  }
}
