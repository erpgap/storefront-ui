import { beforeEach, describe, expect, it, vi } from 'vitest'
import { invalidateAllPageCache, invalidateCmsPageCache } from './cmsCacheInvalidation'

const storage = {
  keys: [] as string[],
  removed: [] as string[],
  getKeys: vi.fn(async (base: string) => storage.keys.filter(k => k.startsWith(base))),
  removeItem: vi.fn(async (key: string) => {
    storage.removed.push(key)
    storage.keys = storage.keys.filter(k => k !== key)
  }),
}

// Keys exactly as Nitro writes them, taken from a running instance: the path
// with every non-word character stripped, then a hash.
const KEYS = [
  'nitro:routes:_:index.AAAA1111.json',
  'nitro:routes:_:index_payloadjso.BBBB2222.json',
  'nitro:routes:_:autumndrop43106.CCCC3333.json',
  'nitro:routes:_:autumndrop43106_.DDDD4444.json',
  'nitro:routes:_:autumndrop431062.EEEE5555.json',
  'nitro:routes:_:women.FFFF6666.json',
  'nitro:routes:_:products_payload.GGGG7777.json',
]

describe('CMS cache invalidation', () => {
  beforeEach(() => {
    storage.keys = [...KEYS]
    storage.removed = []
    vi.clearAllMocks()
    ;(globalThis as any).useStorage = vi.fn(() => storage)
  })

  describe('invalidateCmsPageCache', () => {
    it('removes every cached render of one page', () => {
      // One url has several entries - the page and its payload route.
      return invalidateCmsPageCache('/autumn-drop-43106').then((deleted) => {
        expect(deleted.sort()).toEqual([
          'nitro:routes:_:autumndrop43106.CCCC3333.json',
          'nitro:routes:_:autumndrop43106_.DDDD4444.json',
        ])
      })
    })

    it('does not purge a page whose path merely starts the same', async () => {
      // /autumn-drop-43106 must not evict /autumn-drop-431062.
      const deleted = await invalidateCmsPageCache('/autumn-drop-43106')
      expect(deleted).not.toContain('nitro:routes:_:autumndrop431062.EEEE5555.json')
      expect(storage.keys).toContain('nitro:routes:_:autumndrop431062.EEEE5555.json')
    })

    it('purges the homepage, which Nitro names "index"', async () => {
      // Every character of "/" is non-word, so the derived fragment is empty
      // and the homepage was being skipped entirely - publishing it changed
      // nothing a visitor could see.
      const deleted = await invalidateCmsPageCache('/')
      expect(deleted.sort()).toEqual([
        'nitro:routes:_:index.AAAA1111.json',
        'nitro:routes:_:index_payloadjso.BBBB2222.json',
      ])
    })

    it('ignores an empty slug rather than purging everything', async () => {
      expect(await invalidateCmsPageCache('')).toEqual([])
      expect(storage.removed).toEqual([])
    })

    it('survives a cache that cannot be listed', async () => {
      // A failing cache must not take publishing down with it: the page is
      // still correct in Odoo and will go stale, which beats a failed publish.
      storage.getKeys.mockRejectedValueOnce(new Error('redis down'))
      await expect(invalidateCmsPageCache('/')).resolves.toBeInstanceOf(Array)
    })

    it('survives a key that cannot be removed', async () => {
      storage.removeItem.mockRejectedValueOnce(new Error('nope'))
      await expect(invalidateCmsPageCache('/autumn-drop-43106')).resolves.toBeInstanceOf(Array)
    })
  })

  describe('invalidateAllPageCache', () => {
    it('clears every cached page', async () => {
      // Used for regions, whose urls cannot be enumerated - a stale one is
      // wrong on hundreds of pages at once.
      const removed = await invalidateAllPageCache()
      expect(removed).toBe(KEYS.length)
      expect(storage.keys).toEqual([])
    })

    it('survives a cache that cannot be listed', async () => {
      storage.getKeys.mockRejectedValue(new Error('redis down'))
      await expect(invalidateAllPageCache()).resolves.toBe(0)
    })
  })
})
