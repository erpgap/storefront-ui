import { defineNitroPlugin } from 'nitropack/runtime'
import type { H3Event } from 'h3'

/**
 * The site name, from the Odoo website the request belongs to.
 *
 * nuxt.config's `site.name` is fixed at build time, so every store built from
 * this repo showed the same name in its sitemap. Odoo already knows which
 * website a request is for (from request-host), and that website's name is
 * the one the merchant maintains.
 *
 * Applied to sitemap requests only - the sitemap stylesheet is where the name
 * is shown - so no page render waits on Odoo for it. The name is cached per
 * host. If Odoo cannot say (unreachable, or an addon without the `website`
 * query), `site.name` from the config stays.
 */
const SITEMAP_PATH = /^\/(?:__sitemap__\/|sitemap)/

const websiteName = cachedFunction(async (event: H3Event): Promise<string | null> => {
  const config = useRuntimeConfig(event)
  const response = await $fetch<{ data?: { website?: { name?: string | null } | null } }>(
    new URL('/graphql/vsf', config.public.odooBaseUrl).toString(),
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'request-host': config.public.middlewareUrl || getRequestHost(event),
      },
      body: { query: 'query { website { name } }' },
    },
  ).catch(() => null)

  return response?.data?.website?.name || null
}, {
  name: 'site-name',
  // An empty answer is not cached, so an Odoo hiccup does not pin the
  // fallback name for the whole TTL.
  validate: entry => !!entry.value,
  maxAge: Number(process.env.NUXT_SWR_CACHE_TIME || 3600),
  getKey: (event: H3Event) => getRequestHost(event).replace(/\W/g, '') || 'default',
})

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('site-config:init', async ({ event, siteConfig }) => {
    if (!SITEMAP_PATH.test(event.path)) return

    const name = await websiteName(event)
    if (name) {
      siteConfig.push({ _context: 'odoo-website', _priority: 1, name })
    }
  })
})
