import Redis from 'ioredis'
import { readZepplnBody } from '../../../utils/zepplnSecurity'

export default defineEventHandler(async (event) => {
  // Auth + replay protection. Payload currently unused.
  await readZepplnBody<Record<string, unknown>>(event)

  const config = useRuntimeConfig(event)
  const storageDriver = String(config.cacheInvalidationStorageDriver || process.env.NUXT_STORAGE_DRIVER || '')
  const redisUrl = String(config.cacheInvalidationStorageUrl || process.env.NUXT_STORAGE_URL || '')

  if (storageDriver !== 'redis' || !redisUrl) {
    throw createError({ statusCode: 503, message: 'Redis cache is not configured for this instance' })
  }

  const redis = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 1 })
  try {
    await redis.connect()
    const deleted = Number(await redis.eval(`
      local cursor = '0'
      local deleted = 0
      repeat
        local result = redis.call('SCAN', cursor, 'COUNT', 500)
        cursor = result[1]
        local keys = result[2]
        for _, key in ipairs(keys) do
          if redis.call('TTL', key) > 0 then
            redis.call('DEL', key)
            deleted = deleted + 1
          end
        end
      until cursor == '0'
      return deleted
    `, 0))

    return { ok: true, deleted }
  } finally {
    redis.disconnect()
  }
})
