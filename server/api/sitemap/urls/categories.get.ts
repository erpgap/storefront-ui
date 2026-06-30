import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'

// List only the categories the storefront can actually render — the same
// non-empty set the routes-generator registers (`categories(pageSize)` returns
// categories that have products). The Odoo slug store also holds slugs for
// EMPTY categories, which resolve to a null id for the public/anonymous context
// (no route, 500 on the category query). Putting those in the sitemap would
// advertise 404/500 URLs to crawlers AND make the cache warmer hit them — so we
// derive the list from the same query as the routes, not the raw slug store.
const CATEGORIES_QUERY = `query { categories(pageSize: 10000) { categories { slug } } }`

export default defineSitemapEventHandler(async () => {
  const config = useRuntimeConfig()
  const odooUrl = new URL('/graphql/vsf', config.public.odooBaseUrl).toString()

  const res: any = await $fetch(odooUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: { query: CATEGORIES_QUERY },
  }).catch(() => null)

  const slugs: string[] = (res?.data?.categories?.categories ?? [])
    .map((c: any) => c?.slug)
    .filter((s: string) => !!s && s !== 'false' && s.startsWith('/'))

  return slugs.map(slug => ({
    loc: slug,
    _sitemap: 'categories',
  } satisfies SitemapUrlInput))
})
