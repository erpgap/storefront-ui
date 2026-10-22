import { defineNitroPlugin } from 'nitropack/runtime'

/**
 * Leaves empty sitemaps out of the sitemap index.
 *
 * An index entry with no URLs behind it is a sitemap a crawler fetches for
 * nothing, and in Search Console it reads as a broken one. Which sitemaps are
 * empty depends on the install - a store with no CMS pages, a catalogue still
 * being set up - so rather than special-casing one by name, each child is
 * rendered and the ones without a single <url> are dropped.
 *
 * The children are served under the same SWR rule as the index
 * (/__sitemap__/**), so rendering them here also warms the cache a crawler
 * reads from next. A child that fails to render is kept: hiding a sitemap
 * because Odoo was briefly unreachable would drop real URLs from the index.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('sitemap:index-resolved', async (ctx) => {
    const kept = await Promise.all(ctx.sitemaps.map(async (entry) => {
      const name = (entry as { _sitemapName?: string })._sitemapName
      if (!name) return true

      try {
        const xml = await $fetch<string>(`/__sitemap__/${name}.xml`, {
          responseType: 'text',
          headers: { host: ctx.event.headers.get('host') ?? '' },
        })
        return xml.includes('<url>')
      }
      catch {
        return true
      }
    }))

    ctx.sitemaps = ctx.sitemaps.filter((_, index) => kept[index])
  })
})
