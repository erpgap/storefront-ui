export const useRecentViewProducts = () => {
  const list = useCookie<Number[]>("recent-view-products");

  const addProductToRecentViews = (id: number) => {
    if (list.value?.includes(id)) {
      return;
    }
    list.value?.push(id) || (list.value = [id]);
  };

  const removeProductFromRecentViews = (id: number) => {
    list.value = list.value.filter((productId) => productId !== id);
  };

  return {
    addProductToRecentViews,
    removeProductFromRecentViews,
    list: computed(() => list.value),
  };
};
