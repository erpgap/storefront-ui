const MAX_RECENT_VIEWS = 12
const COOKIE_NAME = 'recent-view-products'
const COOKIE_MAX_AGE = 3600 * 24 * 30

const normalize = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []
  return value
    .map(id => Number(id))
    .filter(id => Number.isFinite(id))
}

export const useRecentViewProducts = () => {
  const cookie = useCookie<number[] | null>(COOKIE_NAME)

  const list = computed(() => normalize(cookie.value))

  const persist = (ids: number[]) => {
    const cookieRef = useCookie<number[]>(COOKIE_NAME, { maxAge: COOKIE_MAX_AGE })
    cookieRef.value = ids
  }

  const addProductToRecentViews = (id: number) => {
    if (import.meta.server || !Number.isFinite(id)) return
    const next = [id, ...list.value.filter(productId => productId !== id)].slice(0, MAX_RECENT_VIEWS)
    persist(next)
  }

  const removeProductFromRecentViews = (id: number) => {
    if (import.meta.server) return
    persist(list.value.filter(productId => productId !== id))
  }

  return {
    addProductToRecentViews,
    removeProductFromRecentViews,
    list,
  }
}
