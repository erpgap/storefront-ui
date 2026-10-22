import { createMemoryHistory, createRouter } from 'vue-router'
import type { Router } from 'vue-router'

const routers = new WeakMap<string[], Router>()

/**
 * The storefront route that would serve `slug` instead of a CMS page, or null
 * when the address is free.
 *
 * Matching goes through Vue Router itself rather than string comparison, so
 * /my-account/my-orders/:id reserves /my-account/my-orders/42 exactly as the
 * real router would.
 */
export function storefrontRouteFor(slug: string, routes: string[]): string | null {
  let router = routers.get(routes)
  if (!router) {
    router = createRouter({
      history: createMemoryHistory(),
      routes: routes.map(path => ({ path, component: {} })),
    })
    routers.set(routes, router)
  }

  const matched = router.resolve(slug).matched
  return matched.length ? matched[matched.length - 1]!.path : null
}
