/**
 * Purging a CMS page's cached HTML.
 *
 * Alokai owns its own cache and is the only side that knows how Nitro names
 * its keys, so Alokai does the purging. Odoo is never told about key formats.
 *
 * Publishing already goes through this app's own API, so the purge happens
 * inline in the same request - no queue, no cron, no callback. A merchant
 * clicks Publish and the next request renders the new content.
 */

/** Nitro's route-cache keys strip every non-word character from the path. */
function cacheKeyFragment(path: string): string {
  return String(path).replace(/\W/g, '')
}

/**
 * Deletes every cached render of a CMS page.
 *
 * Nitro keys a route cache entry by path, and this app's `route-cache` plugin
 * varies it by device, so one URL has several entries. Rather than reproduce
 * that key-building here - which would rot the moment the variance rules
 * change - this scans the route-cache namespace for keys derived from the
 * path, which stays correct however many variants exist.
 */
export async function invalidateCmsPageCache(slug: string): Promise<string[]> {
  const path = String(slug || '').trim()
  if (!path) return []

  // The homepage is a CMS page too, and its cache key fragment is empty
  // because every character of "/" is non-word. Nitro names that route
  // `index`, so match it explicitly rather than skipping it - skipping it
  // meant publishing the homepage changed nothing a visitor could see.
  const fragment = path === '/' ? 'index' : cacheKeyFragment(path)
  if (!fragment) return []

  const storage = useStorage('cache')
  const deleted: string[] = []

  for (const base of ['nitro:routes', '/cache:pages']) {
    let keys: string[] = []
    try {
      keys = await storage.getKeys(base)
    }
    catch {
      // A cache that cannot be listed must not break publishing. The page is
      // still correct in Odoo; it will go stale until the TTL expires, which
      // is strictly better than a failed publish.
      continue
    }

    // Anchored on the fragment so /sale does not purge /sale-2026.
    const pattern = new RegExp(`:${fragment}(?:_|\\.)`)

    for (const key of keys) {
      if (!pattern.test(key)) continue
      try {
        await storage.removeItem(key)
        deleted.push(key)
      }
      catch { /* best effort, same reasoning as above */ }
    }
  }

  return deleted
}

/**
 * Clears every cached page render.
 *
 * For regions, which appear on pages whose urls cannot be listed from here -
 * every category, every product. Blunt, but regions change rarely and a stale
 * one is wrong on hundreds of pages at once, which is far worse than a cold
 * cache for a few minutes.
 */
export async function invalidateAllPageCache(): Promise<number> {
  const storage = useStorage('cache')
  let removed = 0

  for (const base of ['nitro:routes', '/cache:pages']) {
    let keys: string[] = []
    try {
      keys = await storage.getKeys(base)
    }
    catch {
      continue
    }

    for (const key of keys) {
      try {
        await storage.removeItem(key)
        removed++
      }
      catch { /* best effort */ }
    }
  }

  return removed
}
