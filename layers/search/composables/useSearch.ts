import { useDebounceFn, useToggle } from '@vueuse/core'
import { useProductTemplateList } from '../../product/composables/useProductTemplateList'
import { sortByIds, useAlgolia } from './useAlgolia'
import type { Product, ProductFilterInput } from '~~/graphql'

/**
 * The header's search box: suggestions as the shopper types, the results page
 * on Enter, and the open/closed state of the suggestion list. Highlighting the
 * typed text in each suggestion is SearchHitList's job.
 */
export const useSearch = (formSearchTemplateRef?: any) => {
  const route = useRoute()
  const router = useRouter()

  // ---------- Suggestion list ----------
  const searchModalOpen = useState(
    `search-ref-${formSearchTemplateRef ?? 'default'}`,
    () => false,
  )
  const searchModalToggle = useToggle(searchModalOpen)
  const searchModalClose = () => searchModalToggle(false)
  const isSearchModalOpen = computed(() => searchModalOpen.value)

  // ---------- Products ----------
  const {
    loadProductTemplateList,
    productTemplateList,
    totalItems,
    organizedAttributes,
    loading,
    // watchRoute=false: this lives in the header and persists across navigation,
    // so it must NOT refetch on route changes — it queries only when the user
    // types (see search() below).
  } = useProductTemplateList(route.fullPath, 12, '', false)

  const { productIds } = useAlgolia()
  // The ids behind the current suggestions when Algolia chose them.
  const algoliaIds = ref<number[] | null>(null)

  // ---------- Search state ----------
  const searchInputValue = ref('')
  const highlightedIndex = ref(-1)
  const showResultSearch = ref(false)

  // On the results page the box shows what was searched for (?search=...).
  watch(
    () => route.query.search,
    (v) => {
      searchInputValue.value = (v as string) || ''
    },
    { immediate: true },
  )

  // Clearing the box closes the suggestions.
  watch(searchInputValue, (v: any) => {
    if (!v) {
      showResultSearch.value = false
      searchModalOpen.value = false
      highlightedIndex.value = -1
    }
  })

  // ---------- Suggestions, debounced ----------
  const search = useDebounceFn(async () => {
    const query = searchInputValue.value?.trim() || ''

    // Too short to suggest anything useful: close the list.
    if (query.length < 3) {
      showResultSearch.value = false
      searchModalOpen.value = false
      highlightedIndex.value = -1
      return
    }

    // With Algolia, it picks the products and Odoo loads them; without it, or
    // when it does not answer, Odoo searches by itself.
    const ids = await productIds(query, 12)
    algoliaIds.value = ids
    if (ids && !ids.length) {
      showResultSearch.value = false
      searchModalOpen.value = false
      highlightedIndex.value = -1
      return
    }

    // `loading` is a computed over the fetch's `pending`, so it already
    // tracks this request.
    await loadProductTemplateList(ids
      ? { filter: { ids } as ProductFilterInput, pageSize: 12 }
      : { search: query, pageSize: 12 })

    const hasHits = (productTemplateList.value?.length || 0) > 0
    showResultSearch.value = hasHits
    searchModalOpen.value = hasHits
    highlightedIndex.value = hasHits ? 0 : -1
  }, 300)

  // Odoo returns them in its own order; Algolia's ranking is the one to keep.
  const searchHits = computed(() => {
    const hits = productTemplateList.value || []
    return algoliaIds.value ? sortByIds(hits, algoliaIds.value) : hits
  })

  // ---------- Navigation ----------
  const enterPress = () => {
    const q = searchInputValue.value?.trim()
    if (!q) return
    showResultSearch.value = false
    searchModalOpen.value = false
    // No `page`, so a new search starts on the first page.
    router.push({ path: '/search', query: { search: q } })
  }

  const selectHit = (selected: Product) => {
    // A suggestion opens its product page.
    showResultSearch.value = false
    searchModalOpen.value = false
    if (selected?.firstVariant) {
      router.push(
        `${mountUrlSlugForProductVariant(selected.firstVariant as Product)}`,
      )
    }
  }

  // ---------- Keyboard (arrow keys) ----------
  const highlightPrevious = () => {
    const len = searchHits.value.length || 0
    if (!len) return
    highlightedIndex.value = (highlightedIndex.value - 1 + len) % len
  }

  const highlightNext = () => {
    const len = searchHits.value.length || 0
    if (!len) return
    highlightedIndex.value = (highlightedIndex.value + 1) % len
  }

  return {
    // modal
    isSearchModalOpen,
    searchModalOpen,
    searchModalToggle,
    searchModalClose,

    // search
    searchInputValue,
    search,
    searchHits,
    showResultSearch,
    highlightedIndex,
    highlightNext,
    highlightPrevious,
    selectHit,
    enterPress,

    // product data
    totalItems,
    organizedAttributes,
    productTemplateList,
    loading,
  }
}
