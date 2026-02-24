import type {
  Category,
  CategoryResponse,
  QueryCategoriesArgs,
  QueryCategoryArgs,
  BreadcrumbItem,
} from '~/graphql'
import { QueryName } from '~~/server/queries/index'


export const useCategory = (categorySlugIndex: string) => {
  const { $sdk } = useNuxtApp()

  const loading = useState('category-loading', () => false)

  const category = useState<Category>(`category-${categorySlugIndex}`, () => ({} as Category))

  const loadCategory = async (params: { slug: string }) => {
    const cleanParam = {
      slug: params.slug?.endsWith('/')
        ? params.slug?.slice(0, -1)
        : params.slug,
    }
    const { data, status } = await useAsyncData(`category-${cleanParam.slug}`,
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

  const breadcrumbs = computed((): BreadcrumbItem[] => {
    const defaultBreadcrumb = [
      {
        label: 'Home',
        link: '/',
      },
    ];

    if (!category.value || !category.value.id) {
      return defaultBreadcrumb;
    }

    const categoryPath: BreadcrumbItem[] = [];
    let currentCategory: Category | null | undefined = category.value;

    const categoriesInPath: Category[] = [];
    while (currentCategory) {
      categoriesInPath.unshift(currentCategory);
      currentCategory = currentCategory.parent;
    }

    let currentLink = '';
    for (const cat of categoriesInPath) {
      if (cat.slug) {
        currentLink = `/category/${cat.slug}`;
        categoryPath.push({
          label: cat.name || '',
          link: currentLink,
        });
      }
    }

    if (categoryPath.length > 0) {
      categoryPath[categoryPath.length - 1].link = '';
    }

    return [
      ...defaultBreadcrumb,
      ...categoryPath,
    ];
  });

  return {
    loading,
    category,
    loadCategory,
    breadcrumbs,
  }
}
