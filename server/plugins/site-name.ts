import { defineNitroPlugin } from 'nitropack/runtime'

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
 * host (server/utils/odooWebsite.ts). If Odoo cannot say (unreachable, or an
 * addon without the `website` query), `site.name` from the config stays.
 */
const SITEMAP_PATH = /^\/(?:__sitemap__\/|sitemap)/

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('site-config:init', async ({ event, siteConfig }) => {
    if (!SITEMAP_PATH.test(event.path)) return

    const name = (await odooWebsite(event))?.name
    if (name) {
      siteConfig.push({ _context: 'odoo-website', _priority: 1, name })
    }
  })
})
