import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readZepplnBody, zepplnSignature } from './zepplnSecurity'

const TOKEN = 'zeppln-token'
const PATH = '/api/internal/zeppln/stock'

type TestEvent = { method: string, path: string, headers: Record<string, string>, body: string }

function makeEvent(body: string, { token = TOKEN, timestamp = String(Date.now()) } = {}): TestEvent {
  return {
    method: 'POST',
    path: PATH,
    body,
    headers: {
      'x-zeppln-timestamp': timestamp,
      'x-zeppln-signature': zepplnSignature('POST', PATH, timestamp, body, token),
    },
  }
}

describe('zeppln security', () => {
  beforeEach(() => {
    globalThis.__zepplnReplayStore = new Map()
    ;(globalThis as any).useRuntimeConfig = vi.fn(() => ({ zepplnToken: TOKEN }))
    ;(globalThis as any).getHeader = vi.fn((event: TestEvent, name: string) => event.headers[name.toLowerCase()])
    ;(globalThis as any).readRawBody = vi.fn(async (event: TestEvent) => event.body)
    ;(globalThis as any).createError = vi.fn((input: any) =>
      Object.assign(new Error(input.message), { statusCode: input.statusCode }))
  })

  it('returns the body of a request signed with the token', async () => {
    // Signed as sent: Python writes 5.0 where JavaScript would write 5.
    const body = '{"stock":{"7":{"1":5.0}}}'
    await expect(readZepplnBody(makeEvent(body) as any)).resolves.toEqual({ stock: { 7: { 1: 5 } } })
  })

  it('refuses a request signed with another token', async () => {
    await expect(readZepplnBody(makeEvent('{}', { token: 'other' }) as any))
      .rejects.toMatchObject({ statusCode: 401 })
  })

  it('refuses a changed body', async () => {
    const event = makeEvent('{"stock":{}}')
    event.body = '{"stock":{"7":{"1":999}}}'
    await expect(readZepplnBody(event as any)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('refuses an expired request', async () => {
    const event = makeEvent('{}', { timestamp: String(Date.now() - 10 * 60 * 1000) })
    await expect(readZepplnBody(event as any)).rejects.toMatchObject({ statusCode: 401 })
  })

  it('refuses a replayed request', async () => {
    const event = makeEvent('{}')
    await readZepplnBody(event as any)
    await expect(readZepplnBody(event as any)).rejects.toMatchObject({ statusCode: 409 })
  })

  it('is not there without a token', async () => {
    ;(globalThis as any).useRuntimeConfig = vi.fn(() => ({ zepplnToken: '' }))
    await expect(readZepplnBody(makeEvent('{}') as any)).rejects.toMatchObject({ statusCode: 404 })
  })
})
