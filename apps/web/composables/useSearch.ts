import { Product } from "~/graphql";

export const useSearch = () => {
  const config = useRuntimeConfig();
  const route = useRoute();
  const { result: aloliaResults, search: algoliaSearch } =
    useAlgoliaSearch("header");
  const {
    loadProductTemplateList,
    organizedAttributes,
    productTemplateList,
    totalItems,
    categories,
  } = useProductTemplateList(String(route.fullPath));
  const { getFacetsFromURL } = useUiHelpers();

  const loading = ref<boolean>(false);

  const algoliaSearchResultIds = computed(() =>
    aloliaResults.value?.hits.map((hit) => hit?.id)
  );

  const search = async () => {
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
    }

    await loadProductTemplateList(getFacetsFromURL(route.query));
    loading.value = false;
  };
  return {
    loading,
    search,
    organizedAttributes,
    productTemplateList,
    totalItems,
    categories,
  };
};
