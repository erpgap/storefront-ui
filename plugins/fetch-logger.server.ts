// plugins/fetch-logger.server.ts
import { defineNuxtPlugin } from 'nuxt/app'

/*
type GqlBody = {
  query?: string
  operationName?: string
  variables?: Record<string, any>
}*/

type GqlBody =
  | { queryName?: string; operationName?: string; query?: string; variables?: Record<string, any> }
  | string
  | FormData
  | URLSearchParams
  | undefined;

function extractOp(body: GqlBody): { op: string; varsBytes: number; reqBytes: number } {
  // Formas não inspecionáveis (stream/FormData/URLSearchParams): não dá pra ver o nome
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return { op: 'unknown', varsBytes: 0, reqBytes: 0 }
  }
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    return { op: 'unknown', varsBytes: 0, reqBytes: body.toString().length }
  }
  try {
    const asObj =
      typeof body === 'string'
        ? JSON.parse(body)
        : (body && typeof body === 'object' ? body : {}) as any

    // 1) Preferir queryName (quando usa queries persistidas via SDK)
    const fromQueryName = asObj?.queryName as string | undefined
    if (fromQueryName) {
      const varsBytes = JSON.stringify(asObj?.variables ?? {}).length
      const reqBytes = JSON.stringify(asObj).length
      return { op: fromQueryName, varsBytes, reqBytes }
    }

    // 2) operationName padrão do GraphQL
    const fromOperationName = asObj?.operationName as string | undefined
    if (fromOperationName) {
      const varsBytes = JSON.stringify(asObj?.variables ?? {}).length
      const reqBytes = JSON.stringify(asObj).length
      return { op: fromOperationName, varsBytes, reqBytes }
    }

    // 3) Regex no texto da query (quando há query inline)
    const q = asObj?.query
    if (typeof q === 'string') {
      const m = q.match(/\b(query|mutation|subscription)\s+([A-Za-z0-9_]+)/)
      const op = m?.[2] ?? 'unknown'
      const varsBytes = JSON.stringify(asObj?.variables ?? {}).length
      const reqBytes = JSON.stringify(asObj).length
      return { op, varsBytes, reqBytes }
    }

    // Sem nada identificável
    const reqBytes = JSON.stringify(asObj).length
    return { op: 'unknown', varsBytes: 0, reqBytes }
  } catch {
    // body era string não-JSON
    const reqBytes = typeof body === 'string' ? body.length : 0
    return { op: 'unknown', varsBytes: 0, reqBytes }
  }
}

export default defineNuxtPlugin(() => {
  const native = globalThis.fetch.bind(globalThis)
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(typeof input === 'string' ? input : (input as any)?.url ?? '')
    const method = (init?.method ?? 'GET').toUpperCase()
    const t0 = Date.now()

    const { op, varsBytes, reqBytes } = extractOp(init?.body as any)

    try {
      const res = await native(input as any, init)
      const t1 = Date.now()
      const ms = t1 - t0

      // mede resposta
      let resBytes = 0
      try {
        const clone = res.clone()
        const txt = await clone.text()
        resBytes = txt.length
      } catch { /* ignore */ }

      // contadores úteis
      let counts: string | undefined
      try {
        const clone = res.clone()
        const json = await clone.json()
        const data = json?.data
        const prods = data?.products?.products?.length ?? data?.products?.length ?? undefined
        const facets = data?.products?.attributeValues?.length ?? undefined
        if (prods != null || facets != null) {
          counts = `items:${prods ?? '-'} facets:${facets ?? '-'}`
        }
      } catch { /* ignore */ }

      const gqlTag = url.includes('/graphql') ? `GQL ${op}` : method
      console.log(
        `[native fetch SERVER ✓] ${gqlTag} → ${res.status} ${ms}ms` +
        (url ? ` (${url})` : ''),
        `req:${reqBytes}B`,
        `vars:${varsBytes}B`,
        `res:${resBytes}B`,
        counts ? counts : ''
      )

      return res
    } catch (err) {
      const t1 = Date.now()
      const ms = t1 - t0
      const gqlTag = url.includes('/graphql') ? `GQL ${op}` : method
      console.error(`[native fetch SERVER ⨯] ${gqlTag} ${ms}ms`, err)
      throw err
    }
  }
})
