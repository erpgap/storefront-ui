import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'
// Virtual module provided by modules/sitemap-pages, populated at build time.
// @ts-expect-error - resolved by Nitro at build time
import { staticSitemapPages } from '#sitemap-static-pages'

export default defineSitemapEventHandler(() => {
  return (staticSitemapPages as string[]).map(loc => ({
    loc,
    _sitemap: 'pages',
  } satisfies SitemapUrlInput))
})
