import type {
  Product,
  ProductTemplateListResponse,
  QueryProductsArgs,
} from '~~/graphql'
import { QueryName } from '~~/server/queries/index'

export const useProductTemplateListForRecentViews = () => {
  const { list } = useRecentViewProducts()
  const { $sdk } = useNuxtApp()

  const loading = useState(
    `loading-product-template-list-recent-views`,
    () => false,
  )
  const productTemplateList = ref<Product[]>([])

  const loadProductTemplateList = async (excludeId?: number) => {
    // Exclude the current product from the QUERY (not just the display): the
    // slider never shows the product you're already viewing, so querying for it
    // is wasted work — and when it's the only item in your history (e.g. your
    // first product this session) the result is an empty `ids`, so we skip the
    // request entirely and never hit Odoo.
    const ids = (list.value ?? []).filter(id => id !== excludeId)
    if (ids.length === 0) {
      productTemplateList.value = []
      return
    }
    const params: QueryProductsArgs = {
      filter: {
        ids,
      } as any,
    }

    const { data } = await useAsyncData(`product-template-list-for-recent-views-${ids.join('-')}`, () =>
      $sdk().odoo.query<QueryProductsArgs, ProductTemplateListResponse>(
        { queryName: QueryName.GetProductTemplateListQueryForRecentViews },
        params,
        { headers: useRequestHeaders() },
      ), {
      deep: true
    })

    loading.value = false
    productTemplateList.value = data?.value?.products?.products || []
  }

  return {
    loadProductTemplateList,
    list,
    loading,
    productTemplateList,
  }
}
