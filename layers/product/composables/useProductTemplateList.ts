import type { AttributeFacet, AttributeValue, Product, ProductTemplateListResponse, QueryProductsArgs } from '~/graphql'
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

  // Use computed instead of useState for derived values
  const { data, error, execute, pending } = useAsyncData<ProductTemplateListResponse>(
    `product-template-list-${customIndex}`,
    () => 
      $sdk().odoo.query(
        { queryName: QueryName.GetProductTemplateListQuery },
        params.value,
        { headers: useRequestHeaders() },
      ),
    {
      server: true,     
      lazy: false,      
      immediate: true,   
      default: () => null,
    },
  )

  const params = ref<QueryProductsArgs>({})

  const productTemplateList = computed(() => data.value?.products?.products || [])
  const minPrice = computed(() => (data.value?.products as any)?.minPrice ?? null)
  const maxPrice = computed(() => (data.value?.products as any)?.maxPrice ?? null)
  const totalItems = computed(() => data.value?.products?.totalCount || 0)

  const organizedAttributes = computed(() => {
    const attributes = (data.value?.products?.attributeValues as AttributeValue[]) || []
    const filterCounts = (data.value?.products?.filterCounts as FilterCount[]) || []
    
    return computeAttributes(attributes, filterCounts)
  })

  const stockCount = computed(() => {
    const filterCounts = (data.value?.products?.filterCounts as FilterCount[]) || []
    const inStockFilterCount = filterCounts.find(f => f?.type === 'in_stock')
    return inStockFilterCount?.total || 0
  })

  const loading = computed(() => pending.value)

  watch(error, (newError: any) => {
    if (newError) {
      console.error('[useProductTemplateList] GQL error:', newError)
    }
  })

  const loadProductTemplateList = async (newParams: QueryProductsArgs) => {
    params.value = newParams
    await execute()
  }

  function computeAttributes(
    attributes: AttributeValue[] = [],
    filterCounts: FilterCount[] = [],
  ): AttributeFacet[] {
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

      const fc = filterCounts.find(f => f?.id === (item as any)?.id)
      const total = fc?.total ?? 0

      facet.options.push({
        id: String((item as any)?.search),
        value: (item as any)?.id,
        label: (item as any)?.name,
        htmlColor: (item as any)?.htmlColor,
        total,
      })
    }

    const built: AttributeFacet[] = Array.from(facetsMap.values())

    let result: AttributeFacet[]
    
    if (SHOW_ALL_FACETS) {
      result = built
        .slice()
        .sort((a, b) => Number(a.id) - Number(b.id))
    } else {
      const queryParamsKeys = Object.keys(route.query)
      result = built
        .filter((facet) => {
          if (facet.options.length === 1) return false
          if (queryParamsKeys.filter(k => k !== 'sort' && k !== 'list-view').length > 0) {
            return true
          }
          return facet.options.length > 1
        })
        .sort((a, b) => Number(a.id) - Number(b.id))
    }

    // Sort options within each facet
    result.forEach((facet) => {
      facet.options = facet.options.sort((a, b) => a.label.localeCompare(b.label))
    })

    return result
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