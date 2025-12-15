import { useDebounceFn, useToggle } from '@vueuse/core'
import type { Product } from '~/graphql'
import { useProductTemplateList } from '../../product/composables/useProductTemplateList'

/**
 * @Responsibilities
 *  1) Buscar sugestões no Odoo
 *  2) Destacar resultados (feito no componente de lista)
 *  3) Controlar estado do modal/lista de resultados
 */
export const useSearch = (formSearchTemplateRef?: any) => {
  const route = useRoute()
  const router = useRouter()

  // ---------- Modal / dropdown ----------
  const searchModalOpen = useState(
    `search-ref-${formSearchTemplateRef ?? 'default'}`,
    () => false,
  )
  const searchModalToggle = useToggle(searchModalOpen)
  const searchModalClose = () => searchModalToggle(false)
  const isSearchModalOpen = computed(() => searchModalOpen.value)

  // ---------- Fonte de dados (Odoo) ----------
  const {
    loadProductTemplateList,
    productTemplateList,
    totalItems,
    organizedAttributes,
    loading, // loading do composable de produtos
  } = useProductTemplateList(route.fullPath)

  // ---------- Estado local da busca ----------
  const searchInputValue = ref('') // texto digitado
  const highlightedIndex = ref(-1)
  const showResultSearch = ref(false)

  // Sincroniza o input com a URL (?search=...)
  watch(
    () => route.query.search,
    (v: string) => {
      searchInputValue.value = (v as string) || ''
    },
    { immediate: true },
  )

  // Esconde dropdown quando o input é apagado
  watch(searchInputValue, (v: any) => {
    if (!v) {
      showResultSearch.value = false
      searchModalOpen.value = false
      highlightedIndex.value = -1
    }
  })

  // ---------- Buscar sugestões (com debounce) ----------
  const search = useDebounceFn(async () => {
    const query = searchInputValue.value?.trim() || ''

    // Se termo curto, fecha e sai
    if (query.length < 3) {
      showResultSearch.value = false
      searchModalOpen.value = false
      highlightedIndex.value = -1
      return
    }

    try {
      loading.value = true
      await loadProductTemplateList({
        search: query,
        pageSize: 12,
      })

      const hasHits = (productTemplateList.value?.length || 0) > 0
      showResultSearch.value = hasHits
      searchModalOpen.value = hasHits
      highlightedIndex.value = hasHits ? 0 : -1
    } finally {
      loading.value = false
    }
  }, 300)

  // ---------- Derivados ----------
  const searchHits = computed(() => productTemplateList.value || [])

  // ---------- Navegação ----------
  const enterPress = () => {
    const q = searchInputValue.value?.trim()
    if (!q) return
    showResultSearch.value = false
    searchModalOpen.value = false
    router.push({ path: '/search', query: { search: q } }) // sem 'page' => reseta paginação
  }

  const selectHit = (selected: Product) => {
    // A) Ir para a PDP do item selecionado
    showResultSearch.value = false
    searchModalOpen.value = false
    if (selected?.firstVariant) {
      router.push(
        `${mountUrlSlugForProductVariant(selected.firstVariant as Product)}`
      )
    }
  }

  // ---------- Teclado (setas) ----------
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

    // busca
    searchInputValue,
    search,
    searchHits,
    showResultSearch,
    highlightedIndex,
    highlightNext,
    highlightPrevious,
    selectHit,
    enterPress,

    // dados auxiliares
    totalItems,
    organizedAttributes,
    productTemplateList,
    loading,
  }

/*   function computed(arg0: () => any) {
  throw new Error('Function not implemented.')
}

function ref(arg0: string) {
  throw new Error('Function not implemented.')
}

function watch(arg0: () => any, arg1: (v: any) => void, arg2: { immediate: boolean }) {
  throw new Error('Function not implemented.')
} */
}


