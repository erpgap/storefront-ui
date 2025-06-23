import type { AttributeFacet, AttributeValue, BreadcrumbItem, Product, ProductTemplateListResponse, QueryProductsArgs } from '~/graphql'
import { QueryName } from '~/server/queries'

export const useProductTemplateList = (customIndex: string = '') => {
  const { $sdk } = useNuxtApp()
  const route = useRoute()

  const categorySlugIndex = route.path
  const cleanFullSearchIndex = getUniqueUrlFromRouteFilteringByAttributes(route.path, route)

  const minPrice = useState<number | null>(`min-price-template-list${categorySlugIndex}${customIndex}`, () => null)
  const maxPrice = useState<number | null>(`max-price-template-list${categorySlugIndex}${customIndex}`, () => null)
  const loading = useState(`loading-product-template-list${customIndex}`, () => false)
  const stockCount = useState<number>(`stock-count${categorySlugIndex}${customIndex}`, () => 0)
  const totalItems = useState<number>(`total-items${cleanFullSearchIndex}${customIndex}`, () => 0)
  const productTemplateList = useState<Product[]>(`product-template-list${cleanFullSearchIndex}${customIndex}`, () => [])
  const organizedAttributes = useState<AttributeFacet[]>(`attributes${categorySlugIndex}${customIndex}`, () => [])

  const updateVariablesFromData = (data: ProductTemplateListResponse | null) => {
    productTemplateList.value = data?.products?.products || []
    minPrice.value = data?.products?.minPrice || null
    maxPrice.value = data?.products?.maxPrice || null
    totalItems.value = data?.products?.totalCount || 0

    computeAttributes(
      data?.products?.attributeValues as AttributeValue[],
      data?.products?.filterCounts as any[],
    )
  }

  const loadProductTemplateList = async (params: QueryProductsArgs) => {
    const { data, status } = await useAsyncData(
      `${cleanFullSearchIndex}${customIndex}`,
      () =>
        $sdk().odoo.query<QueryProductsArgs, ProductTemplateListResponse>(
          { queryName: QueryName.GetProductTemplateListQuery },
          params,
          { headers: useRequestHeaders() },
        ),
      { lazy: import.meta.client },
    )

    updateVariablesFromData(data.value)

    watch(status, () => {
      if (status.value === 'pending') {
        totalItems.value = 0
        loading.value = true
      }
      if (status.value === 'success' || status.value === 'error') {
        loading.value = false
      }
    })

    watch(data, () => {
      updateVariablesFromData(data.value)
    })
  }

  const computeAttributes = (attributes: AttributeValue[], filterCounts: any[]) => {
    const data: AttributeFacet[] = []

    attributes?.forEach((item: any) => {
      const current = data.find(
        (itemData: { attributeName: any }) =>
          itemData.attributeName === item.attribute?.name,
      )

      if (!current) {
        data.push({
          id: String(item.attribute.id),
          label: item.attribute?.name,
          attributeName: item.attribute?.name,
          open: true,
          size: 10,
          type: item.displayType,
          options: [],
          search: '',
        })
      }

      data
        ?.find(
          (itemData: { attributeName: any }) =>
            itemData?.attributeName === item?.attribute?.name,
        )
        .options.push({
          id: String(item.search),
          value: item.id,
          label: item.name,
          htmlColor: item.htmlColor,
          total:
            filterCounts?.find(filter => filter.id === item?.id)?.total || 0,
        })
    })

    const inStockFilterCount = filterCounts?.find(filter => filter.type === 'in_stock')
    if (inStockFilterCount) {
      stockCount.value = inStockFilterCount.total || 0
    }

    const queryParamsKeys = Object.keys(route.query)

    organizedAttributes.value = data.filter((item) => {
      if (item.options.length === 1) {
        return false
      }
      if (queryParamsKeys?.filter(item => item !== 'sort' && item !== 'list-view').length > 0) {
        return true
      }

      return item.options.length > 1
    })
    organizedAttributes.value = organizedAttributes.value.sort(
      (a, b) => Number(a.id) - Number(b.id),
    )
    organizedAttributes.value.forEach((item) => {
      item.options = item.options.sort((a, b) =>
        a.label.localeCompare(b.label),
      )
    })
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
