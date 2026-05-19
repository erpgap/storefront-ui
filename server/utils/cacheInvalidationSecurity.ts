import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const INVALIDATION_WINDOW_MS = 5 * 60 * 1000

declare global {
  // eslint-disable-next-line no-var
  var __storefrontCacheInvalidationReplayStore: Map<string, number> | undefined
}

function getReplayStore() {
  globalThis.__storefrontCacheInvalidationReplayStore ??= new Map<string, number>()
  return globalThis.__storefrontCacheInvalidationReplayStore
}

function pruneReplayStore(now: number) {
  const store = getReplayStore()

  for (const [key, expiresAt] of store.entries()) {
    if (expiresAt <= now) {
      store.delete(key)
    }
  }
}

export function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map(item => stableSerialize(item)).join(',')}]`
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))

  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`).join(',')}}`
}

function timingSafeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

function readKeyFromRequest(event: H3Event): string {
  const fromHeader = getHeader(event, 'x-invalidation-key')

  if (fromHeader) {
    return fromHeader
  }

  const authorization = getHeader(event, 'authorization') ?? ''

  if (authorization.startsWith('Bearer ')) {
    return authorization.slice(7).trim()
  }

  return ''
}

export function createCacheInvalidationSignature(
  method: string,
  path: string,
  timestamp: string,
  body: unknown,
  signingSecret: string,
): string {
  const payload = `${method}:${path}:${timestamp}:${stableSerialize(body ?? {})}`

  return createHmac('sha256', signingSecret).update(payload).digest('hex')
}

export function assertCacheInvalidationAccess(event: H3Event, body: unknown): void {
  const config = useRuntimeConfig(event)
  const key = config.cacheInvalidationKey as string
  const signingSecret = (config.cacheInvalidationSigningSecret as string) || key

  if (!key || !signingSecret) {
    throw createError({
      statusCode: 500,
      message: 'Cache invalidation secrets are not configured',
    })
  }

  const providedKey = readKeyFromRequest(event)

  if (!providedKey || providedKey !== key) {
    throw createError({ statusCode: 401, message: 'Invalid cache invalidation key' })
  }

  const timestamp = getHeader(event, 'x-invalidation-timestamp') ?? ''

  if (!timestamp || !/^\d+$/.test(timestamp)) {
    throw createError({ statusCode: 401, message: 'Missing or invalid invalidation timestamp' })
  }

  const now = Date.now()

  if (Math.abs(now - Number(timestamp)) > INVALIDATION_WINDOW_MS) {
    throw createError({ statusCode: 401, message: 'Expired cache invalidation timestamp' })
  }

  const signature = getHeader(event, 'x-invalidation-signature') ?? ''

  if (!signature) {
    throw createError({ statusCode: 401, message: 'Missing cache invalidation signature' })
  }

  const expected = createCacheInvalidationSignature(
    event.method,
    event.path,
    timestamp,
    body,
    signingSecret,
  )

  if (!timingSafeCompare(signature, expected)) {
    throw createError({ statusCode: 401, message: 'Invalid cache invalidation signature' })
  }

  pruneReplayStore(now)

  const replayKey = `${event.path}:${timestamp}:${signature}`
  const store = getReplayStore()

  if (store.has(replayKey)) {
    throw createError({ statusCode: 409, message: 'Replay detected for cache invalidation request' })
  }

  store.set(replayKey, now + INVALIDATION_WINDOW_MS)
}
