import type {
  Category,
  CategoryResponse,
  QueryCategoriesArgs,
  QueryCategoryArgs,
} from '~/graphql'
import { QueryName } from '~/server/queries/index'

export const useCategory = (categorySlug?: string) => {
  const { $sdk } = useNuxtApp()

  const loading = useState('category-loading', () => false)
  const category = useState<Category>(
    `category-${categorySlug}`,
    () => ({} as Category),
  )

  const loadCategory = async (params: { slug: string }) => {
    const cleanParam = {
      slug: params.slug?.endsWith('/')
        ? params.slug?.slice(0, -1)
        : params.slug,
    }
    const { data, status } = await useAsyncData(
      () =>
        $sdk().odoo.query<QueryCategoryArgs, CategoryResponse>(
          { queryName: QueryName.GetCategoryQuery },
          cleanParam as QueryCategoryArgs,
          { headers: useRequestHeaders() },
        ),
    )

    if (data.value?.category?.id === 0) {
      showError({
        status: 404,
      })
    }
    category.value = data.value?.category || ({} as Category)

    watch(status, () => {
      if (status.value === 'pending') {
        loading.value = true
      }
      if (status.value === 'success' || status.value === 'error') {
        loading.value = false
      }
    })
  }

  return {
    loading,
    category,
    loadCategory,
  }
}
