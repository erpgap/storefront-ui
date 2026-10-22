import { fileURLToPath } from 'node:url'
import { join, relative } from 'node:path'
import { defineNuxtModule, extendRouteRules } from 'nuxt/kit'
import type { NuxtPage } from 'nuxt/schema'
import { ofetch } from 'ofetch'

/**
 * A route, with SWR caching, for every CMS page that exists at build time.
 *
 * The catch-all in pages/[...cmsSlug].vue already renders any published page,
 * including ones created after the deploy. What it cannot have is a route
 * rule of its own: a rule on the catch-all would cache every URL the router
 * did not claim. So pages known at build time get a concrete route and their
 * own `swr` rule, and pages created since fall through to the catch-all until
 * the next build.
 *
 * Lived in the storefront's routes-generator, next to products and
 * categories. It moved here so a storefront gets cached CMS pages by having
 * the layer, and so the generator only knows about the catalogue.
 */
export default defineNuxtModule({
  meta: {
    name: 'cms-page-routes',
  },
  async setup(_, nuxt) {
    const odooBaseUrl = process.env.NUXT_PUBLIC_ODOO_BASE_URL
    if (!odooBaseUrl) {
      console.error('[cms-page-routes] NUXT_PUBLIC_ODOO_BASE_URL is not set')
      return
    }

    const swr = Number(process.env.NUXT_SWR_CACHE_TIME || 300)
    const page = fileURLToPath(new URL('../../custom-pages/cms-page.vue', import.meta.url))

    // The generated routes are Odoo data, not files: keep them out of the
    // typed-router union, for the reason given at nuxtTypedRouter in the
    // storefront's nuxt.config. Pushed before that module copies its options.
    const typedRouter = ((nuxt.options as any).nuxtTypedRouter ??= {})
    typedRouter.ignoreRoutes = [
      ...(typedRouter.ignoreRoutes ?? []),
      relative(join(nuxt.options.srcDir, nuxt.options.dir.pages), page),
    ]

    let urls: string[] = []
    try {
      const response = await ofetch(new URL('/graphql/vsf', odooBaseUrl).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Which website's pages: see server/utils/cmsOdooWebsite.ts. At
          // build time there is no request, so only the configured URL can
          // say.
          ...(process.env.NUXT_PUBLIC_MIDDLEWARE_URL
            ? { 'request-host': process.env.NUXT_PUBLIC_MIDDLEWARE_URL }
            : {}),
        },
        body: JSON.stringify({
          query: 'query { websitePages(pageSize: 10000) { websitePages { websiteUrl } } }',
        }),
      })
      urls = (response?.data?.websitePages?.websitePages ?? [])
        .map((p: { websiteUrl?: string }) => p.websiteUrl)
        .filter((url: unknown): url is string => typeof url === 'string' && !!url)
        .map((url: string) => (url.startsWith('/') ? url : `/${url}`))
    }
    catch (error) {
      // A build without Odoo still works: every page is served by the
      // catch-all, just without its own cache rule.
      console.error('[cms-page-routes] Could not fetch CMS pages:', error)
      return
    }

    urls.forEach(url => extendRouteRules(url, { swr }))
    console.info(`[cms-page-routes] ${urls.length} CMS pages loaded`)

    nuxt.hook('pages:extend', (pages: NuxtPage[]) => {
      urls.forEach((url) => {
        pages.push({
          name: url.replace(/^\//, '').replace(/\//g, '-'),
          path: url,
          // Without a file the route would match the URL, shadow the
          // catch-all and render an empty page in the site chrome. A real
          // path rather than an alias: @nuxtjs/i18n reads each route's
          // component off disk with plain `fs`.
          file: page,
        })
      })
    })
  },
})
