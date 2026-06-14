import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // Respect browser back/forward restoration.
    if (savedPosition) return savedPosition

    // Anchor links.
    if (to.hash) return { el: to.hash, behavior: 'smooth' }

    // Default: top on real (path-changing) navigation. Query-only listing
    // changes (pagination/filter/sort) are handled reactively in
    // useScrollToTopOnListingChange, once the new products have loaded.
    return { top: 0, left: 0 }
  },
}
