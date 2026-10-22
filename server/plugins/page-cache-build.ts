import { defineNitroPlugin, useRuntimeConfig, useStorage } from 'nitropack/runtime'

const BUILD_KEY = 'page-cache:build'
const PAGE_CACHE_BASE = 'nitro:routes'

/**
 * Empties the page cache when a different build starts serving.
 *
 * A cached page names the build's hashed /_nuxt assets, which the next
 * deploy's container no longer has. modules/page-cache-rules gives every
 * entry the build id as its integrity, but with SWR Nitro still answers a
 * mismatched entry once while it re-renders in the background - so the first
 * visit to each page after a deploy got the old HTML, unstyled and without
 * scripts. Clearing at startup leaves nothing old to serve; refilling it is
 * what scripts/warm-cache.mjs is for.
 */
export default defineNitroPlugin(() => {
  const buildId = String(useRuntimeConfig().app.buildId || '')
  if (!buildId) return

  const storage = useStorage('cache')
  void (async () => {
    try {
      if (await storage.getItem(BUILD_KEY) === buildId) return

      const keys = await storage.getKeys(PAGE_CACHE_BASE)
      await Promise.all(keys.map(key => storage.removeItem(key)))
      await storage.setItem(BUILD_KEY, buildId)
      console.info(`[page-cache] build ${buildId}: cleared ${keys.length} pages cached by an earlier build`)
    }
    catch (error) {
      console.error('[page-cache] could not clear the previous build\'s pages:', error)
    }
  })()
})
