import { useProductAttributes } from './useProductAttributes'
import type {
  AttributeValue,
  BreadcrumbItem,
  Category,
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

  const productTemplate = useState<CustomProductWithStockFromRedis>(`template-${cleanSlug}`,
    () => ({} as CustomProductWithStockFromRedis),
  )

  const breadcrumbs = computed(() => {
    const breadcrumbList: BreadcrumbItem[] = [{ label: 'Home', link: '/' }]
    const categoryChain: { name: string, slug: string }[] = []

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
      breadcrumbList.push({
        label: item.name,
        link: `/${item.slug}`,
      })
    }

    if (productTemplate.value?.name) {
      breadcrumbList.push({
        label: productTemplate.value.name,
        link: '',
      })
    }

    return breadcrumbList
  })

  const loadProductTemplate = async (params: QueryProductArgs) => {
    loadingProductTemplate.value = true

    if (productTemplate?.value?.id) { return }

    const { data, error, status } = await useAsyncData(`product-${cleanSlug}`, () =>
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
      showError({
        statusCode: 404,
        statusMessage: 'Product not found',
      })
    }

    loadingProductTemplate.value = false

    watch(status, (newStatus: string) => {
      loadingProductTemplate.value = newStatus === 'pending'

      if (newStatus === 'success' && data.value?.product) {
        productTemplate.value = (data.value.product as CustomProductWithStockFromRedis) || {}
      }
    })
  }

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