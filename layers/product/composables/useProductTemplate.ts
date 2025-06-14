import { useProductAttributes } from './useProductAttributes'
import type {
  AttributeValue,
  BreadcrumbItem,
  CustomProductWithStockFromRedis,
  ProductResponse,
  QueryProductArgs,
} from '~/graphql'
import { QueryName } from '~/server/queries'

const { getRegularPrice, getSpecialPrice } = useProductAttributes()
export const useProductTemplate = (slug: string) => {
  const cleanSlug = slug?.endsWith('/') ? slug?.slice(0, -1) : slug
  const { $sdk } = useNuxtApp()

  const loadingProductTemplate = useState(
    'loading-product-template',
    () => false,
  )
  const productTemplate = useState<CustomProductWithStockFromRedis>(`product-${cleanSlug}`,
    () => ({} as CustomProductWithStockFromRedis),
  )

  const breadcrumbs = computed(() => {
    const productName
      = productTemplate.value?.name
        || productTemplate.value?.firstVariant?.name
        || 'Product'

    const categories = productTemplate.value?.categories || []

    const categoryCrumbs: BreadcrumbItem[] = categories
      .filter(cat => cat?.name !== 'All')
      .map(cat => ({
        name: cat.name || '',
        link: `/${cat?.slug?.replace(/^\/?/, '')}`,
      }))

    return [
      { name: 'Home', link: '/' },
      ...categoryCrumbs,
      { name: productName, link: '' },
    ]
  })

  const loadProductTemplate = async (params: QueryProductArgs) => {
    if (productTemplate?.value?.id) {
      return
    }
    const { data, error, status } = await useAsyncData(`product-${cleanSlug}`, () =>
      $sdk().odoo.query<QueryProductArgs, ProductResponse>(
        { queryName: QueryName.GetProductTemplateQuery },
        params,
        { headers: useRequestHeaders() },
      ),
    { lazy: import.meta.client },
    )

    if (import.meta.server) {
      productTemplate.value
        = (data?.value?.product as CustomProductWithStockFromRedis) || {}
      if (!productTemplate.value?.id) {
        showError({
          status: 404,
          message: 'Product not found',
        })
      }
    }

    watch(status, () => {
      if (status.value === 'error' && !data?.value) {
        showError({
          status: 404,
          message: 'Product not found',
        })
      }

      if (status.value === 'pending') {
        loadingProductTemplate.value = true
      }
      if (status.value === 'success') {
        loadingProductTemplate.value = false
        productTemplate.value
          = (data?.value?.product as CustomProductWithStockFromRedis) || {}
      }
    })
  }

  // const loadAlternativeProducts = async (params: QueryProductArgs) => {
  //   const { data, error, status } = await useAsyncData(
  //     `alternative-products-${cleanSlug}`,
  //     () =>
  //       $sdk().odoo.query<QueryProductArgs, ProductResponse>(
  //         { queryName: QueryName.GetProductTemplateAlternativeQuery },
  //         params,
  //         { headers: useRequestHeaders() },
  //       ),
  //     { lazy: import.meta.client },
  //   )

  //   if (import.meta.server) {
  //     productTemplate.value.alternativeProducts
  //       = data?.value?.product?.alternativeProducts || []
  //   }

  //   watch(status, () => {
  //     if (status.value === 'pending') {
  //       loadingProductTemplate.value = true
  //     }
  //     if (status.value === 'success') {
  //       loadingProductTemplate.value = false
  //       productTemplate.value.alternativeProducts
  //         = data?.value?.product?.alternativeProducts || []
  //     }
  //   })
  // }

  const specialPrice = computed(() => {
    if (!productTemplate.value?.firstVariant) {
      return
    }
    return getSpecialPrice(productTemplate.value?.firstVariant)
  })

  const regularPrice = computed(() => {
    if (!productTemplate.value?.firstVariant) {
      return
    }
    return getRegularPrice(productTemplate.value?.firstVariant)
  })

  const getAllSizes = computed(() => {
    return productTemplate?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === 'Size')
      ?.map((item: AttributeValue) => ({
        value: item.id,
        label: item.name,
      }))
  })

  const getAllColors = computed(() => {
    return productTemplate?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === 'Color')
      ?.map((item: AttributeValue) => ({
        value: item.id,
        label: item.name,
      }))
  })

  const getAllMaterials = computed(() => {
    return productTemplate?.value?.attributeValues
      ?.filter((item: AttributeValue) => item?.attribute?.name === 'Material')
      ?.map((item: AttributeValue) => ({
        value: item.id,
        label: item.name,
      }))
  })

  return {
    loadProductTemplate,
    breadcrumbs,
    getAllSizes,
    getAllColors,
    getAllMaterials,
    loadingProductTemplate,
    productTemplate,
    regularPrice,
    specialPrice,
  }
}
