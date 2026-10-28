import { defineNitroPlugin } from 'nitropack/runtime'
import { PUBLIC_BASE_URL_KEYS, withoutTrailingSlash } from '~~/shared/url.mjs'

/**
 * Strips the trailing slash from the base URLs in the runtime config.
 *
 * nuxt.config strips them already, but NUXT_PUBLIC_* set at runtime replace
 * those values as they are. Each request gets its own copy of the config, and
 * the page render hands that same copy to the browser, so normalising it here
 * covers both server routes and the app. See shared/url.mjs.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const config = useRuntimeConfig(event).public as Record<string, unknown>
    for (const key of PUBLIC_BASE_URL_KEYS) {
      if (typeof config[key] === 'string') config[key] = withoutTrailingSlash(config[key])
    }
  })
})
