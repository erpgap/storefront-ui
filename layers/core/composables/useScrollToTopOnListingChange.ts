import type { Ref } from 'vue'

/**
 * Scrolls the window to the top when a product listing finishes reloading
 * (pagination / filter / sort). Driven by the `loading` (pending) transition
 * rather than the router, because query-only navigations do not remount the
 * page and products load asynchronously after navigation resolves.
 */
export function useScrollToTopOnListingChange(loading: Ref<boolean>) {
  // Skip the initial load (SSR hydration / first mount); only react to
  // subsequent loaded transitions caused by user navigation.
  let isInitial = true

  watch(loading, async (isLoading, wasLoading) => {
    // Only the falling edge: a reload just completed.
    if (isLoading || !wasLoading) return

    if (isInitial) {
      isInitial = false
      return
    }

    if (!import.meta.client) return

    // Wait for the new grid to be committed to the DOM before scrolling.
    await nextTick()
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  })
}
