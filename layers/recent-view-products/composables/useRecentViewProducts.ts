const MAX_RECENT_VIEWS = 20

export const useRecentViewProducts = () => {
  const list = useCookie<number[]>('recent-view-products', {
    maxAge: 3600 * 24 * 30,
    default: () => [],
  })

  const normalize = (value: unknown): number[] => {
    if (!Array.isArray(value)) return []
    return value
      .map(id => Number(id))
      .filter(id => Number.isFinite(id))
  }

  const addProductToRecentViews = (id: number) => {
    if (!Number.isFinite(id)) return
    const current = normalize(list.value).filter(productId => productId !== id)
    list.value = [id, ...current].slice(0, MAX_RECENT_VIEWS)
  }

  const removeProductFromRecentViews = (id: number) => {
    list.value = normalize(list.value).filter(productId => productId !== id)
  }

  return {
    addProductToRecentViews,
    removeProductFromRecentViews,
    list: computed(() => normalize(list.value)),
  }
}
