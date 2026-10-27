import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const WINDOW_MS = 5 * 60 * 1000

declare global {

  var __zepplnReplayStore: Map<string, number> | undefined
}

export function zepplnSignature(method: string, path: string, timestamp: string, body: string, token: string): string {
  return createHmac('sha256', token).update(`${method}:${path}:${timestamp}:${body}`).digest('hex')
}

/**
 * The body of a request Odoo sends this storefront on Zeppln, once checked to
 * come from Odoo: signed with NUXT_ZEPPLN_TOKEN, the token of the Odoo website
 * made for this storefront, over METHOD:PATH:TIMESTAMP:BODY.
 *
 * The raw body is what is signed, not a re-serialization of the parsed one:
 * Python and JavaScript do not write every number the same way.
 */
export async function readZepplnBody<T>(event: H3Event): Promise<T> {
  const token = String(useRuntimeConfig(event).zepplnToken || '')

  if (!token) {
    // Not a Zeppln storefront.
    throw createError({ statusCode: 404, message: 'Not found' })
  }

  const timestamp = getHeader(event, 'x-zeppln-timestamp') ?? ''
  const now = Date.now()

  if (!/^\d+$/.test(timestamp) || Math.abs(now - Number(timestamp)) > WINDOW_MS) {
    throw createError({ statusCode: 401, message: 'Missing or expired timestamp' })
  }

  const body = (await readRawBody(event)) ?? ''
  const signature = Buffer.from(getHeader(event, 'x-zeppln-signature') ?? '')
  const expected = Buffer.from(zepplnSignature(event.method, event.path, timestamp, body, token))

  if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) {
    throw createError({ statusCode: 401, message: 'Invalid signature' })
  }

  const seen = globalThis.__zepplnReplayStore ??= new Map<string, number>()
  for (const [key, expiresAt] of seen) {
    if (expiresAt <= now) seen.delete(key)
  }
  const replayKey = signature.toString()
  if (seen.has(replayKey)) {
    throw createError({ statusCode: 409, message: 'Replayed request' })
  }
  seen.set(replayKey, now + WINDOW_MS)

  return JSON.parse(body) as T
}
