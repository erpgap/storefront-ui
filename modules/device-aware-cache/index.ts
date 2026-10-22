import { defineNuxtModule } from '@nuxt/kit'

const VIEWPORT_DEVICE_HEADER = 'x-viewport-device'

// Responses that do not depend on the layout: no need to store them per device.
const LAYOUT_FREE = /^\/(?:api|_nuxt|__)\/|\.(?:xml|json|txt|xsl)$/

/**
 * Keys every cached page by device class as well as by path.
 *
 * Route rules with `swr`/`isr`/`cache` are added by several modules
 * (routes-generator for the catalogue, the CMS layer for its pages) and by
 * nuxt.config. Rather than each of them knowing about this header, every
 * page-rendering rule gets it in its `varies` here, once they are all in.
 * See server/middleware/viewport-device.ts for why.
 */
export default defineNuxtModule({
  meta: {
    name: 'device-aware-cache',
  },
  setup(_, nuxt) {
    nuxt.hook('nitro:config', (nitroConfig) => {
      let count = 0
      for (const [path, rule] of Object.entries(nitroConfig.routeRules ?? {})) {
        const caches = rule.swr || rule.isr || (rule.cache && typeof rule.cache === 'object')
        if (!caches || rule.cache === false || LAYOUT_FREE.test(path)) continue

        const cache = typeof rule.cache === 'object' ? rule.cache : {}
        const varies = new Set([...(cache.varies ?? []), VIEWPORT_DEVICE_HEADER])
        rule.cache = { ...cache, varies: [...varies] }
        count++
      }
      console.info(`[device-aware-cache] ${count} cached routes vary by ${VIEWPORT_DEVICE_HEADER}`)
    })
  },
})
