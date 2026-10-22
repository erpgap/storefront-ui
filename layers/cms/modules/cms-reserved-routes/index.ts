import { defineNuxtModule } from '@nuxt/kit'
import type { NuxtPage } from 'nuxt/schema'

// Routes injected by routes-generator for Odoo records. Those addresses are
// checked by Odoo itself, which knows its own slugs; listing them here would
// also freeze them at build time.
const GENERATED_PAGE_DIR = '/custom-pages/'

// The CMS catch-all serves the pages being checked, so it reserves nothing.
const isCatchAll = (path: string) => path.includes('(.*)')

function flatten(pages: NuxtPage[], parent = ''): string[] {
  return pages.flatMap((page) => {
    const path = page.path.startsWith('/')
      ? page.path
      : `${parent.replace(/\/$/, '')}/${page.path}`
    const own = page.file && !page.file.includes(GENERATED_PAGE_DIR) && !isCatchAll(path)
      ? [path]
      : []
    return [...own, ...flatten(page.children ?? [], path)]
  })
}

/**
 * Collects the storefront's own routes so the CMS can refuse a page address
 * one of them would shadow. Vue Router matches real routes before the CMS
 * catch-all, so a page at /cart would save and publish and never be seen.
 *
 * Built from the pages on disk rather than a hand-kept list, so a page added
 * to any layer is reserved without anyone remembering to.
 */
export default defineNuxtModule({
  meta: {
    name: 'cms-reserved-routes',
  },
  setup(_, nuxt) {
    let paths: string[] = []

    nuxt.hook('pages:extend', (pages: NuxtPage[]) => {
      paths = Array.from(new Set(flatten(pages))).sort()
    })

    // Evaluated lazily at Nitro build time, after pages:extend has run (see
    // modules/sitemap-pages for why runtimeConfig would be too early).
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.virtual = nitroConfig.virtual || {}
      nitroConfig.virtual['#cms-reserved-routes'] = () =>
        `export const reservedRoutes = ${JSON.stringify(paths)}`
    })
  },
})
