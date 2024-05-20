import { onClickOutside, useToggle } from "@vueuse/core";

/**
 * @Responsabilities
 *  1 - FETCH from algolia
 *  2 - Higlighth the results
 *  3 - Handle modal state
 */
export const useSearch = (formSearchTemplateRef?: any) => {
  const route = useRoute();
  const router = useRouter();

  // search modal
  const searchModalClose = () => searchModalToggle(false);
  const searchModalOpen = useState("search-ref", () => false);
  const searchModalToggle = useToggle(searchModalOpen);
  const isSearchModalOpen = computed(() => searchModalOpen.value);

  // algolia search
  const { result, search: algoliaSearch } = useAlgoliaSearch("header");

  const loading = useState("algolia-search-loading", () => false);
  const searchInputValue = useState("algolia-search-input", () => "");
  const highlightedIndex = ref(-1);
  const showResultSearch = ref(false);

  watch(
    () => route.query,
    () => {
      searchInputValue.value = "";
    }
  );

  const algoliaSearchResultIds = computed(() =>
    result.value?.hits.map((hit) => hit?.id)
  );

  const search = async () => {
    loading.value = true;

    await algoliaSearch({ query: searchInputValue.value });
    showResultSearch.value = true;

    loading.value = false;
  };

  const searchHits = computed<AlgoliaHitType[]>(() => result.value?.hits || []);

  const selectHit = (hit: AlgoliaHitType) => {
    if (!hit?.name && !searchInputValue.value) return;
    router.push(`/search?search=${hit?.name || searchInputValue.value}`);
    showResultSearch.value = false;
    searchInputValue.value = hit?.name || searchInputValue.value;
  };

  const highlightPrevious = () => {
    if (highlightedIndex.value === 0) {
      highlightedIndex.value = result.value?.length - 1;
    } else {
      highlightedIndex.value -= 1;
    }
  };

  const highlightNext = () => {
    if (highlightedIndex.value === searchHits.value.length - 1) {
      highlightedIndex.value = 0;
    } else {
      highlightedIndex.value += 1;
    }
  };

  onClickOutside(formSearchTemplateRef, () => {
    showResultSearch.value = false;
  });

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
    algoliaSearchResultIds,
  };
};
