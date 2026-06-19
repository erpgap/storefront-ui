import { defineNuxtModule } from '@nuxt/kit'
import type { NuxtPage } from 'nuxt/schema'

// Layer page directories whose routes must never appear in the sitemap:
// auth-gated, user-specific, or transactional flows. Matched against the page
// file path so any page added to these layers is excluded automatically.
const PRIVATE_PAGE_DIRS = [
  '/my-account/pages/',
  '/checkout/pages/',
  '/cart-redis/pages/',
  '/wishlist/pages/',
]

// Specific routes to exclude. The auth layer is public (login/signup/reset
// password are valid landing pages), but these particular routes should not be
// indexed: search results, the PWA offline fallback, a transient confirmation
// page, and the token-gated "set new password" page reached from a reset email.
const EXCLUDED_PATHS = new Set([
  '/search',
  '/offline',
  '/reset-password-success',
  '/forgot-password/new-password',
])

// Pages injected at build time by the routes-generator module for dynamic
// Odoo content. Products and categories already have their own sitemaps, so
// they must not be duplicated here.
const DYNAMIC_PAGE_FILES = [
  'custom-pages/product-page.vue',
  'custom-pages/category-page.vue',
]

function isStaticPublicPage(page: NuxtPage): boolean {
  // Only real file-based pages defined in the repo. This excludes the concrete
  // routes injected by routes-generator: product/category pages (their own
  // sitemaps) and Odoo website pages (emitted by the blogs sitemap), both of
  // which would otherwise create duplicate sitemap entries.
  if (!page.file) {
    return false
  }
  if (DYNAMIC_PAGE_FILES.some(file => page.file!.endsWith(file))) {
    return false
  }
  // Skip private / non-indexable layers.
  if (PRIVATE_PAGE_DIRS.some(dir => page.file!.includes(dir))) {
    return false
  }
  // Skip specific non-indexable routes.
  if (EXCLUDED_PATHS.has(page.path)) {
    return false
  }
  // Skip dynamic routes (those with a route param) — they cannot be
  // enumerated to a concrete URL at build time.
  if (page.path.includes(':') || page.path.includes('*')) {
    return false
  }

  return true
}

export default defineNuxtModule({
  meta: {
    name: 'sitemap-pages',
  },
  setup(_, nuxt) {
    // Populated once routes are resolved. Read lazily when Nitro bundles the
    // virtual module below — by then it is filled.
    let urls: string[] = []

    nuxt.hook('pages:extend', (pages: NuxtPage[]) => {
      urls = Array.from(
        new Set(pages.filter(isStaticPublicPage).map(page => page.path)),
      ).sort()

      console.info(`[sitemap-pages] ✅ ${urls.length} static pages added to the sitemap`)
    })

    // Expose the list to the sitemap source endpoint via a Nitro virtual
    // module. The content function is evaluated lazily at Nitro build time,
    // which runs *after* pages:extend, so `urls` is populated by then.
    // (Setting runtimeConfig in pages:extend would be too late: Nitro
    //  snapshots runtimeConfig during init, before routes are resolved.)
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.virtual = nitroConfig.virtual || {}
      nitroConfig.virtual['#sitemap-static-pages'] = () =>
        `export const staticSitemapPages = ${JSON.stringify(urls)}`
    })
  },
})
