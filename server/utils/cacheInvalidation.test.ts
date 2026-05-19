import hasher from 'object-hash'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildDataCacheKeyPrefixes,
  buildPageCacheKeySuffixes,
  getNormalizedPath,
  getPageType,
  invalidatePageAndRelatedCache,
} from './cacheInvalidation'
import { QueryName } from '../queries'

const storage = {
  keys: [] as string[],
  values: {} as Record<string, unknown>,
  removed: [] as string[],
  getKeys: vi.fn(async (base: string) => storage.keys.filter(key => key.startsWith(base))),
  getItem: vi.fn(async (key: string) => storage.values[key]),
  removeItem: vi.fn(async (key: string) => {
    storage.removed.push(key)
    storage.keys = storage.keys.filter(existing => existing !== key)
  }),
}

describe('cache invalidation', () => {
  beforeEach(() => {
    storage.keys = []
    storage.values = {}
    storage.removed = []
    vi.clearAllMocks()

    ;(globalThis as any).useStorage = vi.fn(() => storage)
  })

  it('normalizes URLs and detects supported page types', () => {
    expect(getNormalizedPath({ url: 'https://store.test/product/the-zen-platform-bed-47/?x=1' })).toBe('/product/the-zen-platform-bed-47')
    expect(getPageType('/')).toBe('homepage')
    expect(getPageType('/product/the-zen-platform-bed-47')).toBe('product')
    expect(getPageType('/products/the-zen-platform-bed-47')).toBe('product')
    expect(getPageType('/category/51')).toBe('category')
    expect(getPageType('/blog/post')).toBe('unknown')
  })

  it('builds Nitro page cache suffixes with the same escape behavior as cachedEventHandler', () => {
    expect(buildPageCacheKeySuffixes('/product/the-zen-platform-bed-47')).toEqual([
      'desktopproductthezenplatformbed47.json',
      'mobileproductthezenplatformbed47.json',
    ])
  })

  it('builds Storefront UI data key prefixes from the queries this project caches', () => {
    const hash = hasher({ slug: '/product/the-zen-platform-bed-47' })

    expect(buildDataCacheKeyPrefixes('/product/the-zen-platform-bed-47', 'product')).toContain(
      `nitro:functions:_:${QueryName.GetProductTemplateQuery}-${hash}-us-`,
    )
  })

  it('removes matching page and query cache keys, including existing pricelist variants', async () => {
    const productHash = hasher({ slug: '/product/the-zen-platform-bed-47' })
    const unrelatedHash = hasher({ slug: '/product/other-product' })

    storage.keys = [
      '/cache:pages:/product/the-zen-platform-bed-47:desktopproductthezenplatformbed47.json',
      '/cache:pages:/product/the-zen-platform-bed-47:mobileproductthezenplatformbed47.json',
      'nitro:routes:_:productthezenpla.abc123.json',
      '/cache:pages:/product/other-product:desktopproductotherproduct.json',
      `/cache:nitro/functions:_:${QueryName.GetProductTemplateQuery}-${productHash}-us-.json`,
      `nitro:functions:_:${QueryName.GetProductTemplateQuery}-${productHash}-us-.json`,
      `/cache:nitro/functions:_:${QueryName.GetProductTemplateQuery}-${productHash}-us--pricelist42.json`,
      `/cache:nitro/functions:_:${QueryName.GetProductVariantQuery}-variant-hash-us-.json`,
      `/cache:nitro/functions:_:${QueryName.GetProductTemplateQuery}-${unrelatedHash}-us-.json`,
    ]

    const result = await invalidatePageAndRelatedCache({ path: '/product/the-zen-platform-bed-47' })

    expect(result.pageType).toBe('product')
    expect(result.pageKeys).toEqual(expect.arrayContaining([
      '/cache:pages:/product/the-zen-platform-bed-47:desktopproductthezenplatformbed47.json',
      '/cache:pages:/product/the-zen-platform-bed-47:mobileproductthezenplatformbed47.json',
      'nitro:routes:_:productthezenpla.abc123.json',
    ]))
    expect(result.dataKeys).toEqual(expect.arrayContaining([
      `/cache:nitro/functions:_:${QueryName.GetProductTemplateQuery}-${productHash}-us-.json`,
      `nitro:functions:_:${QueryName.GetProductTemplateQuery}-${productHash}-us-.json`,
      `/cache:nitro/functions:_:${QueryName.GetProductTemplateQuery}-${productHash}-us--pricelist42.json`,
      `/cache:nitro/functions:_:${QueryName.GetProductVariantQuery}-variant-hash-us-.json`,
    ]))
    expect(storage.removed).toEqual(expect.arrayContaining([
      '/cache:pages:/product/the-zen-platform-bed-47:desktopproductthezenplatformbed47.json',
      '/cache:pages:/product/the-zen-platform-bed-47:mobileproductthezenplatformbed47.json',
      'nitro:routes:_:productthezenpla.abc123.json',
      `/cache:nitro/functions:_:${QueryName.GetProductTemplateQuery}-${productHash}-us-.json`,
      `nitro:functions:_:${QueryName.GetProductTemplateQuery}-${productHash}-us-.json`,
      `/cache:nitro/functions:_:${QueryName.GetProductTemplateQuery}-${productHash}-us--pricelist42.json`,
    ]))
    expect(storage.removed).not.toContain('/cache:pages:/product/other-product:desktopproductotherproduct.json')
    expect(storage.removed).not.toContain(`/cache:nitro/functions:_:${QueryName.GetProductTemplateQuery}-${unrelatedHash}-us-.json`)
  })

  it('supports forced product invalidation for dynamic Storefront UI slugs without a product prefix', async () => {
    const productHash = hasher({ slug: '/the-zen-platform-bed-47' })

    const keys = [
      'nitro:routes:_:thezenplatformb.abc123.json',
      `nitro:functions:_:${QueryName.GetProductTemplateQuery}-${productHash}-us-.json`,
    ]
    storage.keys = [...keys]

    const result = await invalidatePageAndRelatedCache({
      path: '/the-zen-platform-bed-47',
      pageType: 'product',
    })

    expect(result.pageType).toBe('product')
    expect(storage.removed).toEqual(expect.arrayContaining(keys))
  })

  it('computes keys without removing storage entries during dry-run', async () => {
    storage.keys = [
      '/cache:pages:/:desktop.json',
      '/cache:pages:/:mobile.json',
    ]

    const result = await invalidatePageAndRelatedCache({ path: '/', dryRun: true })

    expect(result.dryRun).toBe(true)
    expect(result.pageKeys).toEqual(expect.arrayContaining(storage.keys))
    expect(storage.removeItem).not.toHaveBeenCalled()
  })
})
