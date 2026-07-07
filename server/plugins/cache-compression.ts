/**
 * Remounts the `cache` storage with a compression wrapper around whatever
 * driver is configured (Redis in deployed envs, memory in dev) — every cached
 * value (SSR page HTML, cached data responses) is compressed on write and
 * decompressed on read. See server/utils/cacheCompression.ts for the codec
 * choice and storage format, and why old uncompressed entries keep working.
 *
 * This runs at plugin-init time, before any request traffic, so nothing ever
 * observes the unwrapped driver.
 */
export default defineNitroPlugin(() => {
  const storage = useStorage()
  const mount = storage.getMount('cache:')

  // Only wrap a real mounted driver — if `cache` ever falls back to the root
  // mount (no dedicated storage configured), leave it alone.
  if (!mount.base.startsWith('cache')) {
    return
  }

  storage.unmount(mount.base, false) // keep the driver (and its Redis connection) alive
  storage.mount(mount.base, wrapDriverWithCompression(mount.driver))
})
