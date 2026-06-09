import type {
  AttributeFacet,
  AttributeValue,
  ProductTemplateListResponse,
  QueryProductsArgs,
} from '~~/graphql'
import { QueryName } from '~~/server/queries'
import { useUiHelpers } from '~~/layers/category/composables/useUiHelpers'

const SHOW_ALL_FACETS = true
const IGNORED_QUERY_PARAMS = ['list-view'] as const

type FilterCount = {
  id: number | string
  type: string
  total: number
}

function omitQueryParams(
  query: Record<string, unknown>,
  keys: readonly string[],
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(query).filter(([k]) => !keys.includes(k)),
  )
}

function buildAttributeFacets(
  attributes: AttributeValue[],
  filterCounts: FilterCount[],
  activeQueryParams: Record<string, unknown>,
): AttributeFacet[] {
  const facetsMap = new Map<string, AttributeFacet>()

  for (const item of attributes) {
    const attrName = item.attribute?.name
    const attrId = item.attribute?.id
    if (!attrName || attrId == null) continue

    if (!facetsMap.has(attrName)) {
      facetsMap.set(attrName, {
        id: String(attrId),
        label: attrName,
        attributeName: attrName,
        open: true,
        size: 10,
        type: item.displayType ?? undefined,
        options: [],
        search: '',
      })
    }

    const fc = filterCounts.find(f => f.id === item.id)

    facetsMap.get(attrName)!.options.push({
      id: String(item.search),
      value: item.id,
      label: item.name ?? '',
      htmlColor: item.htmlColor ?? '',
      total: fc?.total ?? 0,
    })
  }

  const built = Array.from(facetsMap.values())

  const filtered = SHOW_ALL_FACETS
    ? built
    : built.filter((facet) => {
        if (facet.options.length <= 1) return false
        const hasActiveFilters = Object.keys(activeQueryParams).some(
          k => k !== 'sort' && k !== 'list-view',
        )
        return hasActiveFilters || facet.options.length > 1
      })

  const sorted = filtered.sort((a, b) => Number(a.id) - Number(b.id))

  for (const facet of sorted) {
    facet.options = facet.options.sort((a, b) => a.label.localeCompare(b.label))
  }

  return sorted
}

export const useProductTemplateList = (customIndex = '', defaultPageSize = 20) => {
  const nuxtApp = useNuxtApp() as any
  const $sdk: () => any = nuxtApp.$sdk
  const route = useRoute()
  const { getFacetsFromURL } = useUiHelpers()

  const paramOverride = ref<QueryProductsArgs | null>(null)

  const listingQuery = computed(() =>
    omitQueryParams(route.query as Record<string, unknown>, IGNORED_QUERY_PARAMS),
  )

  const queryArgs = computed<QueryProductsArgs>(() => {
    const fromUrl = getFacetsFromURL(listingQuery.value as Record<string, any>, [], defaultPageSize)
    const override = paramOverride.value ?? {}

    return {
      ...fromUrl,
      ...override,
      pageSize: override.pageSize ?? fromUrl.pageSize ?? defaultPageSize,
      currentPage: override.currentPage ?? fromUrl.currentPage ?? 1,
      filter: {
        ...fromUrl.filter,
        ...override.filter,
      },
    }
  })

  const asyncDataKey = computed(
    () => `product-template-list-${customIndex}-${JSON.stringify(queryArgs.value)}`,
  )

  const { data, error, refresh, pending } = useAsyncData<ProductTemplateListResponse>(
    asyncDataKey,
    () =>
      $sdk().odoo.query(
        { queryName: QueryName.GetProductTemplateListQuery },
        queryArgs.value,
        { headers: useRequestHeaders() },
      ),
    {
      server: true,
      lazy: false,
      immediate: false,
      default: () => null,
      watch: [listingQuery, paramOverride],
    },
  )

  const productTemplateList = computed(() => data.value?.products?.products ?? [])
  const minPrice = computed(() => data.value?.products?.minPrice ?? null)
  const maxPrice = computed(() => data.value?.products?.maxPrice ?? null)
  const totalItems = computed(() => data.value?.products?.totalCount ?? 0)
  const loading = computed(() => pending.value)

  const organizedAttributes = computed(() => {
    const attributes = (data.value?.products?.attributeValues ?? []) as AttributeValue[]
    const filterCounts = (data.value?.products?.filterCounts ?? []) as FilterCount[]

    return buildAttributeFacets(attributes, filterCounts, listingQuery.value)
  })

  const stockCount = computed(() => {
    const filterCounts = (data.value?.products?.filterCounts ?? []) as FilterCount[]
    return filterCounts.find(f => f.type === 'in_stock')?.total ?? 0
  })

  watch(error, (err: unknown) => {
    if (err) console.error('[useProductTemplateList] GQL error:', err)
  })

  const loadProductTemplateList = async (newParams: QueryProductsArgs = {}) => {
    paramOverride.value = Object.keys(newParams).length > 0 ? newParams : null
    await refresh()
  }

  return {
    loadProductTemplateList,
    loading,
    productTemplateList,
    organizedAttributes,
    totalItems,
    minPrice,
    maxPrice,
    stockCount,
    error,
  }
}
