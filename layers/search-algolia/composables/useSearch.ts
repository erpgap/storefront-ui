import { onClickOutside, useToggle } from '@vueuse/core'
import { debounce } from 'lodash-es'
import type { QueryProductsArgs } from '~/graphql';

/**
 * @Responsabilities
 *  1 - FETCH from algolia
 *  2 - Higlighth the results
 *  3 - Handle modal state
 */
export const useSearch = (formSearchTemplateRef?: any) => {
  const route = useRoute()
  const router = useRouter()

  // search modal
  const searchModalClose = () => searchModalToggle(false)
  const searchModalOpen = useState('search-ref', () => false)
  const searchModalToggle = useToggle(searchModalOpen)
  const isSearchModalOpen = computed(() => searchModalOpen.value)

  // odoo search
  const {
    loadProductTemplateList,
    organizedAttributes,
    productTemplateList,
    totalItems,
  } = useProductTemplateList(String(route.fullPath))
  const { getFacetsFromURL } = useUiHelpers()
  const loading = useState('odoo-search-loading', () => false)
  const searchInputValue = useState('odoo-search-input', () => '')
  const highlightedIndex = ref(-1)
  const showResultSearch = ref(false)

  watch(
    () => route.query,
    () => {
      searchInputValue.value = ''
    },
  )

  const search = async () => {
    console.log('Search function called with searchInputValue:', searchInputValue.value);
    loading.value = true

    const params: QueryProductsArgs = {
      ...getFacetsFromURL(route.query),
      search: searchInputValue.value,
    };
    
    await loadProductTemplateList(params)
    showResultSearch.value = true
    console.log('showResultSearch after loadProductTemplateList:', showResultSearch.value);

    loading.value = false
  }
  const debouncedSearch = debounce(search, 300)

  // Watch searchInputValue to trigger search-as-you-type
  watch(searchInputValue, (newValue) => {
    console.log('searchInputValue changed:', newValue);
    if (newValue) {
      debouncedSearch()
    } else {
      showResultSearch.value = false
      console.log('showResultSearch (cleared):', showResultSearch.value);
      // Optionally clear productTemplateList if desired when input is empty
      // productTemplateList.value = []
    }
  })

  const searchHits = computed(() => {
    console.log('searchHits computed:', productTemplateList.value);
    return productTemplateList.value || []
  })

  const selectHit = (hit: string) => {
    if (!hit && !searchInputValue.value) return
    router.push(`/search?search=${hit || searchInputValue.value}`)
    showResultSearch.value = false
    searchInputValue.value = hit || searchInputValue.value
  }

  const highlightPrevious = () => {
    if (highlightedIndex.value === 0) {
      highlightedIndex.value = productTemplateList.value?.length - 1
    }
    else {
      highlightedIndex.value -= 1
    }
  }

  const highlightNext = () => {
    if (highlightedIndex.value === searchHits.value.length - 1) {
      highlightedIndex.value = 0
    }
    else {
      highlightedIndex.value += 1
    }
  }

  onClickOutside(formSearchTemplateRef, () => {
    showResultSearch.value = false
    console.log('onClickOutside: showResultSearch set to false');
  })

  return {
    // search modal
    searchModalClose,
    isSearchModalOpen,
    searchModalOpen,
    searchModalToggle,

    // algolia search
    loading,
    searchInputValue,
    highlightNext,
    highlightPrevious,
    highlightedIndex,
    search,
    selectHit,
    showResultSearch,
    searchHits,
  }
}
