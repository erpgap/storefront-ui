import type {
  AttributeFacet,
  AttributeValue,
  Product,
  ProductTemplateListResponse,
  QueryProductsArgs,
} from '~/graphql'
import { QueryName } from '~/server/queries'

const SHOW_ALL_FACETS = true

type FilterCount = {
  id?: number | string
  type?: string
  total?: number
}

export const useProductTemplateList = (customIndex = '') => {
  const nuxtApp = useNuxtApp() as any
  const $sdk: () => any = nuxtApp.$sdk

  const route = useRoute()

  const categorySlugIndex = computed(() => route.fullPath)
  const cleanFullSearchIndex = computed(() =>
    getUniqueUrlFromRouteFilteringByAttributes(route.path, route),
  )

  const minPrice = useState<number | null>(
    `min-price-template-list${categorySlugIndex.value}${customIndex}`,
    () => null,
  )
  const maxPrice = useState<number | null>(
    `max-price-template-list${categorySlugIndex.value}${customIndex}`,
    () => null,
  )
  const loading = useState<boolean>(
    `loading-product-template-list${customIndex}`,
    () => false,
  )
  const stockCount = useState<number>(
    `stock-count${categorySlugIndex.value}${customIndex}`,
    () => 0,
  )
  const totalItems = useState<number>(
    `total-items${cleanFullSearchIndex.value}${customIndex}`,
    () => 0,
  )
  const productTemplateList = useState<Product[]>(
    `product-template-list${cleanFullSearchIndex.value}${customIndex}`,
    () => [],
  )
  const organizedAttributes = useState<AttributeFacet[]>(
    `attributes${categorySlugIndex.value}${customIndex}`,
    () => [],
  )

    function updateVariablesFromData(data: ProductTemplateListResponse | null) {
      const products = data?.products
  
        console.log('---------------- BACKEND RAW FACETS ----------------')
        console.log('attributeValues:', JSON.stringify(products?.attributeValues, null, 2))
        console.log('filterCounts:', JSON.stringify(products?.filterCounts, null, 2))
        console.log('totalCount:', products?.totalCount)
        console.log('products returned:', products?.products?.length)
        console.log('----------------------------------------------------')
  
      productTemplateList.value = products?.products || []
      minPrice.value = (products as any)?.minPrice ?? null
      maxPrice.value = (products as any)?.maxPrice ?? null
      totalItems.value = products?.totalCount || 0
  
      computeAttributes(
        (products?.attributeValues as AttributeValue[]) || [],
        (products?.filterCounts as FilterCount[]) || [],
      )
    } 

  const loadProductTemplateList = async (params: QueryProductsArgs) => {
    loading.value = true
    try {
      const { data, error } =
        await useAsyncData(
          `product-list:${cleanFullSearchIndex.value}${customIndex}`,
          () => {
            return $sdk().odoo.query(
              { queryName: QueryName.GetProductTemplateListQuery },
              params,
              { headers: useRequestHeaders() },
            )
          },
          {
            server: true,
            lazy: false,
            default: () => null,
          }
        )

      if (error.value) {
        console.error('[useProductTemplateList] GQL error:', error.value)
      }

      updateVariablesFromData(data.value ?? null)
    } catch (err) {
      console.error('[useProductTemplateList] load error:', err)
      productTemplateList.value = []
    } finally {
      loading.value = false
    }
  }

  function computeAttributes(
    attributes: AttributeValue[] = [],
    filterCounts: FilterCount[] = [],
  ) {
    console.log(
      '[compute] attrs len:',
      attributes?.length,
      'filterCounts len:',
      filterCounts?.length,
    )

    const facetsMap = new Map<string, AttributeFacet>()

    for (const item of attributes) {
      const attr = (item as any)?.attribute
      const attrName: string | undefined = attr?.name
      const attrId: number | string | undefined = attr?.id
      if (!attrName || !attrId) continue

      let facet = facetsMap.get(attrName)
      if (!facet) {
        facet = {
          id: String(attrId),
          label: attrName,
          attributeName: attrName,
          open: true,
          size: 10,
          type: (item as any)?.displayType,
          options: [],
          search: '',
        }
        facetsMap.set(attrName, facet)
      }

      const fc = filterCounts.find((f) => f?.id === (item as any)?.id)
      const total = fc?.total ?? 0

      facet.options.push({
        id: String((item as any)?.search),
        value: (item as any)?.id,
        label: (item as any)?.name,
        htmlColor: (item as any)?.htmlColor,
        total,
      })
    }

    const inStockFilterCount = filterCounts.find((f) => f?.type === 'in_stock')
    if (inStockFilterCount) stockCount.value = inStockFilterCount.total || 0

    const built: AttributeFacet[] = Array.from(facetsMap.values())

    console.log('[compute] data result before filter:', built)

    if (SHOW_ALL_FACETS) {
      organizedAttributes.value = built
        .slice()
        .sort((a: AttributeFacet, b: AttributeFacet) => Number(a.id) - Number(b.id))
    } else {
      const queryParamsKeys = Object.keys(route.query)
      organizedAttributes.value = built
        .filter((facet: AttributeFacet) => {
          if (facet.options.length === 1) return false
          if (
            queryParamsKeys.filter((k) => k !== 'sort' && k !== 'list-view')
              .length > 0
          ) {
            return true
          }
          return facet.options.length > 1
        })
        .sort((a: AttributeFacet, b: AttributeFacet) => Number(a.id) - Number(b.id))
    }

    organizedAttributes.value.forEach((facet: AttributeFacet) => {
      facet.options = facet.options.sort((a, b) => a.label.localeCompare(b.label))
    })

    console.log('[compute] organizedAttributes:', organizedAttributes.value)
  }

  return {
    loadProductTemplateList,
    minPrice,
    maxPrice,
    loading,
    productTemplateList,
    organizedAttributes,
    totalItems,
    stockCount,
  }
}
