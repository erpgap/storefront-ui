import { defineNuxtModule } from 'nuxt/kit'

const VIEWPORT_DEVICE_HEADER = 'x-viewport-device'

// Responses that do not depend on the layout: no need to store them per device.
const LAYOUT_FREE = /^\/(?:api|_nuxt|__)\/|\.(?:xml|json|txt|xsl)$/

/**
 * Adjusts every page-rendering cached route rule, once all of them are in.
 *
 * Route rules with `swr`/`isr`/`cache` come from several modules
 * (routes-generator for the catalogue, the CMS layer for its pages) and from
 * nuxt.config. Rather than each of them knowing about this, every one gets:
 *
 * - `varies: ['x-viewport-device']`: pages are cached per device class, since
 *   the server renders a different header and filter sidebar for each. See
 *   server/middleware/viewport-device.ts.
 * - `integrity: <build id>`: a page cached by one build is not served by the
 *   next. Nitro's default integrity is a hash of the handler, which is the
 *   same code from one build to the next, so after a deploy cached pages kept
 *   referencing the previous build's /_nuxt assets - gone from the new
 *   container - until they expired, and those visits got a page whose scripts
 *   404ed.
 */
export default defineNuxtModule({
  meta: {
    name: 'page-cache-rules',
  },
  setup(_, nuxt) {
    nuxt.hook('nitro:config', (nitroConfig) => {
      const integrity = nuxt.options.buildId
      let count = 0
      for (const [path, rule] of Object.entries(nitroConfig.routeRules ?? {})) {
        const caches = rule.swr || rule.isr || (rule.cache && typeof rule.cache === 'object')
        if (!caches || rule.cache === false || LAYOUT_FREE.test(path)) continue

        const cache = typeof rule.cache === 'object' ? rule.cache : {}
        const varies = new Set([...(cache.varies ?? []), VIEWPORT_DEVICE_HEADER])
        rule.cache = { ...cache, varies: [...varies], integrity }
        count++
      }
      console.info(`[page-cache-rules] ${count} cached routes vary by ${VIEWPORT_DEVICE_HEADER}, scoped to build ${integrity}`)
    })
  },
})
