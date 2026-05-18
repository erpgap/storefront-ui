import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  assertCacheInvalidationAccess,
  createCacheInvalidationSignature,
  stableSerialize,
} from './cacheInvalidationSecurity'

type TestEvent = {
  method: string
  path: string
  headers: Record<string, string>
}

function makeEvent(body: unknown, overrides: Partial<TestEvent> = {}) {
  const event: TestEvent = {
    method: 'POST',
    path: '/api/internal/invalidate-cache',
    headers: {},
    ...overrides,
  }
  const timestamp = String(Date.now())
  const signature = createCacheInvalidationSignature(
    event.method,
    event.path,
    timestamp,
    body,
    'signing-secret',
  )

  event.headers = {
    'x-invalidation-key': 'shared-key',
    'x-invalidation-timestamp': timestamp,
    'x-invalidation-signature': signature,
    ...event.headers,
  }

  return event as any
}

describe('cache invalidation security', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.__storefrontCacheInvalidationReplayStore = new Map()

    ;(globalThis as any).useRuntimeConfig = vi.fn(() => ({
      cacheInvalidationKey: 'shared-key',
      cacheInvalidationSigningSecret: 'signing-secret',
    }))
    ;(globalThis as any).getHeader = vi.fn((event: TestEvent, name: string) =>
      event.headers[name.toLowerCase()],
    )
    ;(globalThis as any).createError = vi.fn((input: any) => {
      const error = new Error(input.message) as Error & { statusCode: number }
      error.statusCode = input.statusCode
      return error
    })
  })

  it('serializes nested objects with stable key ordering', () => {
    expect(stableSerialize({ url: '/x', dryRun: false, nested: { z: 1, a: 2 } })).toBe(
      '{"dryRun":false,"nested":{"a":2,"z":1},"url":"/x"}',
    )
  })

  it('accepts a valid signed request once', () => {
    const body = { url: '/product/the-zen-platform-bed-47' }
    const event = makeEvent(body)

    expect(() => assertCacheInvalidationAccess(event, body)).not.toThrow()
  })

  it('rejects replayed requests with the same timestamp and signature', () => {
    const body = { url: '/product/the-zen-platform-bed-47' }
    const event = makeEvent(body)

    assertCacheInvalidationAccess(event, body)

    expect(() => assertCacheInvalidationAccess(event, body)).toThrow('Replay detected')
  })

  it('rejects invalid signatures', () => {
    const body = { url: '/product/the-zen-platform-bed-47' }
    const event = makeEvent(body, {
      headers: {
        'x-invalidation-signature': 'bad-signature',
      },
    })

    expect(() => assertCacheInvalidationAccess(event, body)).toThrow('Invalid cache invalidation signature')
  })
})
