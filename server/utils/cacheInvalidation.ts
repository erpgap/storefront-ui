import hasher from 'object-hash'
import { QueryName } from '../queries'

export type CachePageType = 'homepage' | 'product' | 'category' | 'unknown'

export type InvalidateCacheInput = {
  path?: string
  url?: string
  dryRun?: boolean
  pageType?: CachePageType
}

export type InvalidateCacheResult = {
  dryRun: boolean
  pageType: CachePageType
  normalizedPath: string
  pageKeys: string[]
  dataKeys: string[]
  deletedKeys: string[]
}

const ISO_CODES = ['', 'us', 'eu'] as const
// Where Nitro keeps pages cached by route rules (swr/isr). The only page cache:
// a second one, server/plugins/route-cache.ts, cached nothing and is gone.
const PAGE_CACHE_PREFIX = 'nitro:routes:_:'
const DATA_CACHE_PREFIXES = ['/cache:nitro/functions:_:', 'nitro:functions:_:'] as const

function escapeNitroCacheKey(value: string): string {
  return String(value).replace(/\W/g, '')
}

function getTargetUrl(input: InvalidateCacheInput): URL | null {
  const raw = input.url || input.path || ''
  if (!raw) {
    return null
  }

  try {
    return new URL(raw, 'https://cache.local')
  }
  catch {
    return null
  }
}

export function getNormalizedPath(input: InvalidateCacheInput): string {
  const url = getTargetUrl(input)
  const raw = url?.pathname || ''

  if (!raw) {
    return ''
  }

  return raw.replace(/\/+$/g, '') || '/'
}

export function getPageType(path: string): CachePageType {
  if (path === '/') {
    return 'homepage'
  }

  if (/^\/products?\//.test(path)) {
    return 'product'
  }

  if (/^\/(?:category|categories|collections?)\//.test(path)) {
    return 'category'
  }

  return 'unknown'
}

/**
 * The fragment Nitro names a page's route-cache entries by: the pathname with
 * every non-word character stripped, cut to 16 characters ("index" for the
 * homepage). The page is `<prefix><fragment>.<hash>…`, its payload
 * `<prefix><fragment>_…` (or the same 16 characters, for a long path).
 *
 * Paths sharing their first 16 characters share it, so a purge can take a
 * neighbour's entry too. That errs the safe way: a page re-rendered for
 * nothing, never a stale one left behind.
 */
export function pageCacheKeyFragment(normalizedPath: string): string {
  return normalizedPath === '/' ? 'index' : escapeNitroCacheKey(normalizedPath).slice(0, 16)
}

function productSlugCandidates(normalizedPath: string): string[] {
  const withoutPrefix = normalizedPath.replace(/^\/products?\//, '')

  return [...new Set([
    normalizedPath,
    withoutPrefix,
    `/${withoutPrefix}`,
  ].filter(Boolean))]
}

function categorySlugCandidates(normalizedPath: string): string[] {
  const withoutPrefix = normalizedPath.replace(/^\/(?:category|categories|collections?)\//, '')

  return [...new Set([
    normalizedPath,
    withoutPrefix,
    `/${withoutPrefix}`,
  ].filter(Boolean))]
}

function buildQueryKeyPrefixes(queryName: QueryName, variables: Record<string, unknown>): string[] {
  const hash = hasher(variables)

  return DATA_CACHE_PREFIXES.flatMap(prefix =>
    ISO_CODES.map(isoCode => `${prefix}${queryName}-${hash}-${isoCode}-`),
  )
}

function buildQueryNamePrefixes(queryName: QueryName): string[] {
  return DATA_CACHE_PREFIXES.map(prefix => `${prefix}${queryName}-`)
}

export function buildDataCacheKeyPrefixes(normalizedPath: string, pageType: CachePageType): string[] {
  if (pageType === 'homepage') {
    return buildQueryKeyPrefixes(QueryName.GetWebsiteHomepageQuery, {})
  }

  if (pageType === 'product') {
    const productTemplatePrefixes = productSlugCandidates(normalizedPath).flatMap(slug =>
      buildQueryKeyPrefixes(QueryName.GetProductTemplateQuery, { slug }),
    )

    return [
      ...productTemplatePrefixes,
      ...buildQueryNamePrefixes(QueryName.GetProductVariantQuery),
    ]
  }

  if (pageType === 'category') {
    const categoryPrefixes = categorySlugCandidates(normalizedPath).flatMap(slug =>
      buildQueryKeyPrefixes(QueryName.GetCategoryQuery, { slug }),
    )

    return [
      ...categoryPrefixes,
      ...buildQueryNamePrefixes(QueryName.GetProductTemplateListQuery),
    ]
  }

  return []
}

function buildExactDataKeys(prefixes: string[]): string[] {
  return prefixes.map(prefix => `${prefix}.json`)
}

async function getExistingKeys(storage: any, base: string): Promise<string[]> {
  if (typeof storage.getKeys !== 'function') {
    return []
  }

  try {
    const keys = await storage.getKeys(base)
    if (keys.length > 0) {
      return keys
    }

    const allKeys = await storage.getKeys()
    return allKeys.filter((key: string) => key.startsWith(base))
  }
  catch {
    return []
  }
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}

function getRedisUrl(): string {
  try {
    const config = useRuntimeConfig()
    if (config.cacheInvalidationStorageDriver === 'redis' && config.cacheInvalidationStorageUrl) {
      return String(config.cacheInvalidationStorageUrl)
    }
  }
  catch {
    // Unit tests and build-time imports may not have Nuxt runtime context.
  }

  if (process.env.NUXT_STORAGE_DRIVER === 'redis' && process.env.NUXT_STORAGE_URL) {
    return process.env.NUXT_STORAGE_URL
  }

  return ''
}

async function withRedis<T>(callback: (redis: any) => Promise<T>): Promise<T | null> {
  const redisUrl = getRedisUrl()

  if (!redisUrl) {
    return null
  }

  let redis: any

  try {
    const Redis = (await import('ioredis')).default
    redis = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    })
    await redis.connect()
    return await callback(redis)
  }
  catch {
    return null
  }
  finally {
    if (redis) {
      redis.disconnect()
    }
  }
}

async function scanRedisKeys(patterns: string[]): Promise<string[]> {
  const keys = await withRedis(async (redis) => {
    const found = new Set<string>()

    for (const pattern of patterns) {
      let cursor = '0'

      do {
        const [nextCursor, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 1000)
        cursor = nextCursor
        batch.forEach((key: string) => found.add(key))
      } while (cursor !== '0')
    }

    return [...found]
  })

  return keys || []
}

async function removeRedisKeys(keys: string[]): Promise<void> {
  await withRedis(async (redis) => {
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  })
}

async function findExistingPageKeys(storage: any, normalizedPath: string): Promise<string[]> {
  const fragment = pageCacheKeyFragment(normalizedPath)
  if (!fragment) return []

  const [storedKeys, redisKeys] = await Promise.all([
    getExistingKeys(storage, PAGE_CACHE_PREFIX),
    scanRedisKeys([`${PAGE_CACHE_PREFIX}${fragment}*`]),
  ])
  const pattern = new RegExp(`^${PAGE_CACHE_PREFIX}${fragment}[._]`)
  return [...storedKeys, ...redisKeys].filter(key => pattern.test(key))
}

async function findExistingDataKeys(storage: any, dataPrefixes: string[]): Promise<string[]> {
  const keysByPrefix = await Promise.all(
    DATA_CACHE_PREFIXES.map(prefix => getExistingKeys(storage, prefix)),
  )
  const redisDataKeys = await scanRedisKeys(dataPrefixes.map(prefix => `${prefix}*`))

  return [...keysByPrefix.flat(), ...redisDataKeys]
    .filter(key => dataPrefixes.some(prefix => key.startsWith(prefix)))
}

export async function invalidatePageAndRelatedCache(
  input: InvalidateCacheInput,
): Promise<InvalidateCacheResult> {
  const normalizedPath = getNormalizedPath(input)
  const dryRun = Boolean(input.dryRun)
  const pageType = input.pageType && input.pageType !== 'unknown'
    ? input.pageType
    : getPageType(normalizedPath)
  const storage = useStorage()

  const existingPageKeys = await findExistingPageKeys(storage, normalizedPath)

  const dataPrefixes = buildDataCacheKeyPrefixes(normalizedPath, pageType)
  const exactDataKeys = buildExactDataKeys(dataPrefixes)
  const existingDataKeys = await findExistingDataKeys(storage, dataPrefixes)

  const pageKeys = unique(existingPageKeys)
  const dataKeys = unique([...exactDataKeys, ...existingDataKeys])
  const deletedKeys = unique([...pageKeys, ...dataKeys])

  if (!dryRun) {
    await Promise.all(deletedKeys.map(key => storage.removeItem(key)))
    await removeRedisKeys(deletedKeys)
  }

  return {
    dryRun,
    pageType,
    normalizedPath,
    pageKeys,
    dataKeys,
    deletedKeys,
  }
}
