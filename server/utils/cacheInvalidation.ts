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
const PAGE_CACHE_PREFIXES = ['/cache:pages:', 'nitro:routes:_:'] as const
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

export function buildPageCacheKeySuffixes(normalizedPath: string): string[] {
  return ['desktop', 'mobile'].map(device => `${escapeNitroCacheKey(`${device}-${normalizedPath}`)}.json`)
}

export function buildKnownPageKeys(normalizedPath: string): string[] {
  const suffixes = buildPageCacheKeySuffixes(normalizedPath)
  const routeCandidates = normalizedPath === '/' ? ['/'] : [normalizedPath, '/**', '/:slug(.*)*']

  return routeCandidates.flatMap(route =>
    suffixes.flatMap(suffix =>
      PAGE_CACHE_PREFIXES.map(prefix => `${prefix}${route}:${suffix}`),
    ),
  )
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

async function keyContainsPath(storage: any, key: string, normalizedPath: string): Promise<boolean> {
  if (typeof storage.getItem !== 'function') {
    return false
  }

  try {
    const value = await storage.getItem(key)
    return JSON.stringify(value).includes(normalizedPath)
  }
  catch {
    return false
  }
}

async function findExistingPageKeys(storage: any, normalizedPath: string, pageSuffixes: string[]): Promise<string[]> {
  const escapedPath = escapeNitroCacheKey(normalizedPath)
  const shortenedPathPrefix = escapedPath.slice(0, 15)
  const keysByPrefix = await Promise.all(
    PAGE_CACHE_PREFIXES.map(prefix => getExistingKeys(storage, prefix)),
  )
  const redisPageKeys = await scanRedisKeys(
    PAGE_CACHE_PREFIXES.flatMap(prefix => [
      `${prefix}*${escapedPath}*`,
      `${prefix}*${shortenedPathPrefix}*`,
    ]),
  )
  const allPageKeys = [...keysByPrefix.flat(), ...redisPageKeys]
  const matchingKeys: string[] = []

  for (const key of allPageKeys) {
    if (pageSuffixes.some(suffix => key.endsWith(`:${suffix}`))) {
      matchingKeys.push(key)
      continue
    }

    if (escapedPath && key.includes(escapedPath)) {
      matchingKeys.push(key)
      continue
    }

    if (shortenedPathPrefix.length >= 8 && key.includes(shortenedPathPrefix)) {
      matchingKeys.push(key)
      continue
    }

    if (await keyContainsPath(storage, key, normalizedPath)) {
      matchingKeys.push(key)
    }
  }

  return matchingKeys
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

  const pageSuffixes = buildPageCacheKeySuffixes(normalizedPath)
  const knownPageKeys = buildKnownPageKeys(normalizedPath)
  const existingPageKeys = await findExistingPageKeys(storage, normalizedPath, pageSuffixes)

  const dataPrefixes = buildDataCacheKeyPrefixes(normalizedPath, pageType)
  const exactDataKeys = buildExactDataKeys(dataPrefixes)
  const existingDataKeys = await findExistingDataKeys(storage, dataPrefixes)

  const pageKeys = unique([...knownPageKeys, ...existingPageKeys])
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
