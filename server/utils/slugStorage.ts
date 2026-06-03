const SLUG_KEY_PREFIX = 'slug:'

export const SlugModels = {
  product: 'product.template',
  category: 'product.public.category',
  websitePage: 'alokai.website.page',
} as const

function decodeSlugFromKey(key: string): string | null {
  const normalizedKey = normalizeSlugStorageKey(key)
  if (!normalizedKey.startsWith(SLUG_KEY_PREFIX)) {
    return null
  }

  const encodedSlug = normalizedKey.slice(SLUG_KEY_PREFIX.length)
  if (!encodedSlug) {
    return null
  }

  try {
    return decodeURIComponent(encodedSlug)
  }
  catch {
    return null
  }
}

function normalizeSlugStorageKey(key: string): string {
  const prefixIndex = key.indexOf(SLUG_KEY_PREFIX)
  return prefixIndex >= 0 ? key.slice(prefixIndex) : key
}

function isValidSlug(slug: string): boolean {
  return Boolean(slug) && slug !== 'false'
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

async function withRedis<T>(callback: (redis: import('ioredis').default) => Promise<T>): Promise<T | null> {
  const redisUrl = getRedisUrl()

  if (!redisUrl) {
    return null
  }

  let redis: import('ioredis').default | undefined

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
    redis?.disconnect()
  }
}

async function getSlugKeysFromStorage(): Promise<string[]> {
  const storage = useStorage<string>('slug')

  if (typeof storage.getKeys !== 'function') {
    return []
  }

  try {
    const prefixedKeys = await storage.getKeys(SLUG_KEY_PREFIX)
    if (prefixedKeys.length > 0) {
      return prefixedKeys.map(normalizeSlugStorageKey)
    }

    const allKeys = await storage.getKeys()
    return allKeys
      .map(normalizeSlugStorageKey)
      .filter(key => key.startsWith(SLUG_KEY_PREFIX))
  }
  catch {
    return []
  }
}

async function scanSlugKeysFromRedis(): Promise<string[]> {
  const keys = await withRedis(async (redis) => {
    const found = new Set<string>()

    let cursor = '0'
    do {
      const [nextCursor, batch] = await redis.scan(cursor, 'MATCH', `*${SLUG_KEY_PREFIX}*`, 'COUNT', 1000)
      cursor = nextCursor
      batch.forEach((key: string) => found.add(normalizeSlugStorageKey(key)))
    } while (cursor !== '0')

    return [...found]
  })

  return keys || []
}

async function getSlugKeys(): Promise<string[]> {
  const storageKeys = await getSlugKeysFromStorage()
  if (storageKeys.length > 0) {
    return storageKeys
  }

  return scanSlugKeysFromRedis()
}

async function getModelForKey(storageKey: string): Promise<string | null> {
  const storage = useStorage<string>('slug')
  const value = await storage.getItem(storageKey)
  return value ?? null
}

/**
 * Returns decoded URL slugs for all entries in the slug storage mount matching the given Odoo model.
 */
export async function getSlugsByModel(model: string): Promise<string[]> {
  const keys = await getSlugKeys()
  if (keys.length === 0) {
    return []
  }

  const slugs = await Promise.all(
    keys.map(async (storageKey) => {
      const slug = decodeSlugFromKey(storageKey)
      if (!slug || !isValidSlug(slug)) {
        return null
      }

      const storedModel = await getModelForKey(storageKey)
      return storedModel === model ? slug : null
    }),
  )

  return slugs.filter((slug): slug is string => slug !== null)
}
