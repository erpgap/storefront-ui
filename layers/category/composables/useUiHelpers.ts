import type { ProductFilterInput, QueryProductsArgs } from '~~/graphql'

export const useUiHelpers = () => {
  const route = useRoute()
  const router = useRouter()

  const queryParamsNotFilters = ['page', 'sort', 'itemsPerPage', 'search']
  const localePrefixes = ['/en', '/de', '/ru']

  const pathToSlug = (): string | null => {
    const path = route.path?.replace(/\/$/, '') || ''
    for (const localePrefix of localePrefixes) {
      if (path.startsWith(localePrefix)) {
        const p = path.replace(localePrefix, '')
        return p === '' ? null : p
      }
    }
    if (path === '/' || path === '/search') return null
    return path || null
  }

  const cleanFullSearchIndex = computed(() =>
    getUniqueUrlFromRouteFilteringByAttributes(route.path, route),
  )

  
 const getFacetsFromURL = (
    query: Record<string, any>,
    ids: number[] = [],
  ): QueryProductsArgs => {
    const filters: string[] = []

    Object.keys(query || {}).forEach((key) => {
      if (![...queryParamsNotFilters, 'price', 'Price', 'Availability', 'availability', 'inStock'].includes(key)) {
        const raw = String(query[key] ?? '')
        if (!raw) return
        raw.split(',').forEach((val) => {
          if (val) filters.push(val)
        })
      }
    })

    const rawPrice = (query?.price ?? query?.Price ?? '') as string
    const [minS, maxS] = String(rawPrice).split('-')
    const minPrice = minS && !isNaN(Number(minS)) ? Number(minS) : undefined
    const maxPrice = maxS && !isNaN(Number(maxS)) ? Number(maxS) : undefined

    const availabilityRaw = query?.Availability || query?.in_stock;
    const availabilityStr =
      String(availabilityRaw).toLowerCase() === 'true'
        ? 'true'
        : undefined

    const pageSize = query.itemsPerPage ? parseInt(query.itemsPerPage) : 20
    const page = query?.page ? parseInt(query.page) : 1

    const sortParts = String(query?.sort ?? '').split(',')
    const sort =
      sortParts.length === 2
        ? ({ [sortParts[0]]: sortParts[1] } as any)
        : undefined

    const productFilters: Partial<ProductFilterInput> = {
      minPrice,
      maxPrice,
      attribValues: filters,
      categorySlug: pathToSlug(),
      inStock: availabilityStr as any,
      ids,
    }

    return {
      pageSize,
      currentPage: page,
      sort: sort as any,
      filter: productFilters as ProductFilterInput,
      search: query?.search ?? undefined,
    }
  }


  const facetsFromUrlToFilter = () => {
    const q = route.query as Record<string, any>
    const out: any[] = []

    Object.keys(q).forEach((label) => {
      if (queryParamsNotFilters.includes(label)) return
      const raw = String(q[label] ?? '')
      if (!raw) return


      const parts = raw.split(',').filter(Boolean)
      for (const value of parts) {
        if (label === 'price' || label === 'Price') {
          out.push({ filterName: 'price', label: value, id: value })
        } else if (label === 'availability' || label === 'Availability' || label === 'in_stock') {
          out.push({ filterName: 'Availability', label: 'true', id: 'true' })
        } else {
          out.push({ filterName: label, label: value, id: value })
        }
      }
    })
    return out
  }

  const selectedFilters = useState<any[]>(
    `category-selected-filters${cleanFullSearchIndex.value}`,
    () => facetsFromUrlToFilter() || [],
  )

  const isFilterSelected = (option: any) =>
    selectedFilters.value.some((f: { id: any }) => String(f.id) === String(option.id))

  const isStockSelected = () =>
    selectedFilters.value.some(
      (f: { filterName: string; id: any }) => f.filterName === 'Availability' && String(f.id) === 'true',
    )


  const changeFilters = (filters: any[], sort: string) => {
    const q: Record<string, string> = {}

    for (const el of filters) {
      if (String(el.filterName).toLowerCase() === 'price') {
        q.price = String(el.id) 
        continue
      }
      if (el.filterName === 'Availability') {
        q.Availability = 'true' 
        continue
      }
      const key = String(el.filterName)
      q[key] = q[key] ? `${q[key]},${el.label}` : String(el.label)
    }

    if (sort) q.sort = String(sort)

    const current = route.query as Record<string, any>
    if (current.itemsPerPage) q.itemsPerPage = String(current.itemsPerPage)

    delete q.page

    router.push({ path: route.path, query: q })
  }

  return {
    getFacetsFromURL,
    changeFilters,
    facetsFromUrlToFilter,
    isFilterSelected,
    isStockSelected,
    selectedFilters,
  }
}
