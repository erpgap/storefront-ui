import type {
  Product,
  ProductTemplateListResponse,
  QueryProductsArgs,
} from '~/graphql'
import { QueryName } from '~/server/queries/index'

export const useProductTemplateListForRecentViews = () => {
  const { list } = useRecentViewProducts()
  const { $sdk } = useNuxtApp()

  const loading = useState(
    `loading-product-template-list-recent-views`,
    () => false,
  )
  const productTemplateList = ref<Product[]>([])

  const loadProductTemplateList = async () => {
    if (list.value === undefined || list.value?.length === 0) {
      return
    }
    const params: QueryProductsArgs = {
      filter: {
        ids: list.value,
      } as any,
    }

    const { data } = await useAsyncData(
      () =>
        $sdk().odoo.query<QueryProductsArgs, ProductTemplateListResponse>(
          { queryName: QueryName.GetProductTemplateListQueryForRecentViews },
          params,
          { headers: useRequestHeaders() },
        ),
    )

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
