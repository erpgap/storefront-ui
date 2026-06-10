import { useProductAttributes } from './useProductAttributes'
import type {
  AttributeValue,
  BreadcrumbItem,
  Category,
  CustomProductWithStockFromRedis,
  ProductResponse,
  QueryProductArgs,
} from '~~/graphql'
import { QueryName } from '~~/server/queries'

export const useProductTemplate = (slug: string) => {
  const cleanSlug = slug?.endsWith('/') ? slug.slice(0, -1) : slug
  const { $sdk } = useNuxtApp()
  const { getRegularPrice, getSpecialPrice } = useProductAttributes()

  const loadingProductTemplate = useState('loading-product-template', () => false)

  const productTemplate = useState<CustomProductWithStockFromRedis>(
    `template-${cleanSlug}`,
    () => ({} as CustomProductWithStockFromRedis),
  )

  const breadcrumbs = computed(() => {
    const breadcrumbList: BreadcrumbItem[] = [{ label: 'Home', link: '/' }]
    const categoryChain: { name: string; slug: string }[] = []

    if (productTemplate.value?.categories?.length > 0) {
      let current: Category | null | undefined = productTemplate.value.categories[0]

      while (current) {
        categoryChain.unshift({
          name: current.name as string,
          slug: current.slug?.replace(/^\/?/, '') || '',
        })
        current = current.parent
      }
    }

    for (const item of categoryChain) {
      breadcrumbList.push({ label: item.name, link: `/${item.slug}` })
    }

    if (productTemplate.value?.name) {
      breadcrumbList.push({ label: productTemplate.value.name, link: '' })
    }

    return breadcrumbList
  })

  const loadProductTemplate = async (params: QueryProductArgs) => {
    loadingProductTemplate.value = true

    if (productTemplate.value?.id) {
      loadingProductTemplate.value = false
      return
    }

    const { data, status } = await useAsyncData(`product-${cleanSlug}`, () =>
      $sdk().odoo.query<QueryProductArgs, ProductResponse>(
        { queryName: QueryName.GetProductTemplateQuery },
        params,
        { headers: useRequestHeaders() },
      ),
    )

    if (data.value?.product) {
      productTemplate.value = (data.value.product as CustomProductWithStockFromRedis) || {}
    }

    if (!productTemplate.value?.id && status.value !== 'pending') {
      showError({ statusCode: 404, statusMessage: 'Product not found' })
    }

    loadingProductTemplate.value = false

    watch(status, (newStatus: string) => {
      loadingProductTemplate.value = newStatus === 'pending'

      if (newStatus === 'success' && data.value?.product) {
        productTemplate.value = (data.value.product as CustomProductWithStockFromRedis) || {}
      }
    })
  }

  /**
   * Returns options for a single variant axis (e.g. "Color", "Size").
   * Each option carries the attribute value id and its display label.
   */
  const getAttributeOptions = (attributeName: string) =>
    computed(() =>
      productTemplate.value?.attributeValues
        ?.filter((item: AttributeValue) => item?.attribute?.name === attributeName)
        ?.map((item: AttributeValue) => ({ value: item.id, label: item.name })) ?? [],
    )

  const getAllColors = getAttributeOptions('Color')
  const getAllSizes = getAttributeOptions('Size')
  const getAllMaterials = getAttributeOptions('Material')

  const regularPrice = computed(() => {
    if (!productTemplate.value?.firstVariant) return undefined
    return getRegularPrice(productTemplate.value.firstVariant)
  })

  const specialPrice = computed(() => {
    if (!productTemplate.value?.firstVariant) return undefined
    return getSpecialPrice(productTemplate.value.firstVariant)
  })

  return {
    loadProductTemplate,
    breadcrumbs,
    getAttributeOptions,
    getAllColors,
    getAllSizes,
    getAllMaterials,
    loadingProductTemplate,
    productTemplate,
    regularPrice,
    specialPrice,
  }
}
