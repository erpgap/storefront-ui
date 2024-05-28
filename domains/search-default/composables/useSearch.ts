import { onClickOutside, useToggle } from "@vueuse/core";

/**
 * @Responsabilities
 *  1 - FETCH from odoo
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

  // odoo search
  const {
    loadProductTemplateList,
    productTemplateList,
    loading,
    totalItems,
    organizedAttributes,
    categories,
  } = useProductTemplateList(route.fullPath, route.fullPath);
  const { getFacetsFromURL } = useUiHelpers();
  const searchInputValue = useState("odoo-search-input", () => "");
  const highlightedIndex = ref(-1);
  const showResultSearch = ref(false);

  watch(
    () => route.query,
    () => {
      searchInputValue.value = "";
    }
  );

  const search = async () => {
    loading.value = true;

    await loadProductTemplateList(getFacetsFromURL(route.query));

    showResultSearch.value = true;

    loading.value = false;
  };

  const searchHits = computed(() => productTemplateList.value || []);

  const selectHit = (hit: string) => {
    if (!hit && !searchInputValue.value) return;
    router.push(`/search?search=${hit || searchInputValue.value}`);
    showResultSearch.value = false;
    searchInputValue.value = hit || searchInputValue.value;
  };

  const highlightPrevious = () => {
    if (highlightedIndex.value === 0) {
      highlightedIndex.value = productTemplateList.value?.length - 1;
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

    // odoo search
    loading,
    searchInputValue,
    highlightNext,
    highlightPrevious,
    highlightedIndex,
    search,
    selectHit,
    showResultSearch,
    searchHits,
    totalItems,
    organizedAttributes,
    categories,
    productTemplateList,
  };
};
