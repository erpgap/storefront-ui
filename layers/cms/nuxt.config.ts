import { fileURLToPath } from 'node:url'
import type { NitroRouteConfig } from 'nitropack/types'

// The CMS ENGINE: block renderer, page and region rendering, the catch-all
// route, the /api/cms server routes and their Odoo store, and the shared block
// machinery (seeding, validation, migrations) under `shared/`. All of the
// rendering half ships to production visitors.
//
// It knows no block by name. Which blocks exist - their schemas, migrations and
// the components that draw them - comes from the storefront's catalogue,
// imported through `#cms-blocks`:
//
//   #cms-blocks/schemas   blockSchemas, blockMigrations   (no Vue; Nitro loads it)
//   #cms-blocks/registry  blockComponents, blocksNeedingId (client/SSR only)
//
// Here that is layers/cms-blocks, which sets the alias in its own config.
//
// The editor lives in `layers/cms-editor` precisely so its bundle — palette,
// inspector, media picker, drag-and-drop — never reaches a shopper.
export default defineNuxtConfig({
  alias: {
    '#cms': fileURLToPath(new URL('./', import.meta.url)),
  },
  routeRules: {
    // Drafts and editor reads: never cached, never crawled.
    // `robots` (@nuxtjs/robots) is outside Nitro's route rule type: see cms-editor's config.
    '/api/cms/**': { swr: false, prerender: false, robots: false } as NitroRouteConfig,
  },
  // Published CMS pages are listed in the `pages` sitemap, with the
  // storefront's other pages: a crawler has no use for a sitemap of "pages
  // made in the CMS". Layer configs are merged with defu, which appends this
  // source to the storefront's own `pages` sources (and creates the sitemap in
  // a storefront that has none). Read live from Odoo, so pages created after a
  // deploy are listed too.
  sitemap: {
    sitemaps: {
      pages: {
        sources: ['/api/cms/sitemap'],
      },
    },
  },
})
