import { onClickOutside, useToggle } from "@vueuse/core";
import type { AlgoliaHitType } from "~/types/algolia";

export const useSearch = (formSearchTemplateRef?: any) => {
  const route = useRoute();
  const router = useRouter();
  const config = useRuntimeConfig();

  // search modal
  const searchModalClose = () => searchModalToggle(false);
  const searchModalOpen = useState("search-ref", () => false);
  const searchModalToggle = useToggle(searchModalOpen);
  const isSearchModalOpen = computed(() => searchModalOpen.value);

  // algolia search
  const { result: aloliaResults, search: algoliaSearch } =
    useAlgoliaSearch("header");
  const loading = ref(false);
  const searchInputValue = ref((route.query?.search as string) || "");
  const highlightedIndex = ref(-1);
  const showResultSearch = ref(false);
  const {
    loadProductTemplateList,
    organizedAttributes,
    productTemplateList,
    totalItems,
    categories,
  } = useProductTemplateList(String(route.fullPath));
  const { getFacetsFromURL } = useUiHelpers();

  const algoliaSearchResultIds = computed(() =>
    aloliaResults.value?.hits.map((hit) => hit?.id)
  );

  const search = async () => {
    loading.value = true;
    if (Number(config.public.algoliaEnabled)) {
      await algoliaSearch({ query: route.query.search });
      const newQuery = { ...route.query };
      delete newQuery.search;
      await loadProductTemplateList(
        getFacetsFromURL(newQuery, algoliaSearchResultIds.value)
      );
      loading.value = false;
      return;
    }

    await loadProductTemplateList(getFacetsFromURL(route.query));
    loading.value = false;
  };

  const setInputValue = (value: string) => {
    searchInputValue.value = value;
  };

  const selectHit = (hit: AlgoliaHitType) => {
    if (!hit?.name && !searchInputValue.value) return;
    router.push(`/search?search=${hit?.name || searchInputValue.value}`);
    showResultSearch.value = false;
    searchInputValue.value = hit?.name || searchInputValue.value;
  };

  const highlightPrevious = () => {
    if (highlightedIndex.value === 0) {
      highlightedIndex.value = aloliaResults.value.length - 1;
    } else {
      highlightedIndex.value -= 1;
    }
    setInputValue(searchHits.value[highlightedIndex.value]?.name);
  };

  const highlightNext = () => {
    if (highlightedIndex.value === searchHits.value.length - 1) {
      highlightedIndex.value = 0;
    } else {
      highlightedIndex.value += 1;
    }
    setInputValue(searchHits.value[highlightedIndex.value]?.name);
  };

  watch(
    () => route,
    () => (searchInputValue.value = (route.query.search as string) || ""),
    { deep: true, immediate: true }
  );

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
    organizedAttributes,
    productTemplateList,
    totalItems,
    categories,
    selectHit,
    showResultSearch,
  };
};
