import { onClickOutside } from '@vueuse/core';
import { useToggle } from '@vueuse/core';
import { AlgoliaHitType } from '~/types/algolia';

export const useSearch = (formSearchTemplateRef?: any) => {
  const route = useRoute();
  const router = useRouter();

  // search modal
  const searchModalClose = () => searchModalToggle(false);
  const searchModalOpen = useState('search-ref', () => false);
  const searchModalToggle = useToggle(searchModalOpen);
  const isSearchModalOpen = computed(() => searchModalOpen.value);

  // algolia search
  const { result, search: algoliaSearch } = useAlgoliaSearch('header');
  const searchInputValue = ref((route.query?.search as String) || '');
  const highlightedIndex = ref(-1);
  const showResultSearch = ref(false);
  const searchHits = computed<AlgoliaHitType[]>(() => result.value?.hits || []);
  const isSearchOpen = computed(() => searchHits.value?.length > 0);

  const algoliaSearchResultIds = computed(() =>
    aloliaResults.value?.hits.map((hit) => hit?.id)
  );

  const search = async (event: Event) => {
    loading.value = true;
    if (Number(config.public.alogliaEnabled)) {
      await algoliaSearch({ query: route.query.search });
      const newQuery = { ...route.query };
      delete newQuery.search;
      await loadProductTemplateList(
        getFacetsFromURL(newQuery, algoliaSearchResultIds.value)
      );
      loading.value = false;
      return;
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
      highlightedIndex.value = searchHits.value.length - 1;
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
    () => (searchInputValue.value = (route.query.search as String) || ''),
    { deep: true, immediate: true },
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
    searchInputValue,
    highlightNext,
    highlightPrevious,
    highlightedIndex,
    search,
    searchHits,
    selectHit,
    showResultSearch,
  };
};
