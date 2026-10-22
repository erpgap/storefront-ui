import { fileURLToPath } from 'node:url'

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
    '/api/cms/**': { swr: false, prerender: false, robots: false },
  },
  // Published CMS pages get a sitemap of their own, merged into the
  // storefront's @nuxtjs/sitemap config. Read live from Odoo, so pages created
  // after a deploy are listed too.
  sitemap: {
    sitemaps: {
      'cms-pages': {
        sources: ['/api/cms/sitemap'],
        defaults: { changefreq: 'weekly', priority: 0.6 },
      },
    },
  },
})
