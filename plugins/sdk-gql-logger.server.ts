import { defineNuxtPlugin } from 'nuxt/app'

// Tipos frouxos para não brigar com TS do SDK
type OdooQueryFn = (
  cfg: { queryName?: string },
  vars?: Record<string, any>,
  opts?: { headers?: Record<string, any> }
) => Promise<any>

export default defineNuxtPlugin((nuxtApp) => {
  const sdkAny = (nuxtApp as any).$sdk?.()
  if (!sdkAny?.odoo?.query) {
    console.warn('[sdk-gql-logger] $sdk().odoo.query não encontrado')
    return
  }

  const originalQuery: OdooQueryFn = sdkAny.odoo.query.bind(sdkAny.odoo)

  sdkAny.odoo.query = (async (cfg, vars, opts) => {
    const op = cfg?.queryName || 'unknown'
    const v = vars ?? {}
    const headers = { ...(opts?.headers || {}), 'x-gql-op': op }

    const varsBytes = safeLen(v)
    const t0 = now()
    try {
      const res = await originalQuery(cfg, v, { ...(opts || {}), headers })
      const ms = now() - t0

      // resumo básico da resposta
      const resBytes = safeLen(res?.data ?? res)
      const productsCount = res?.data?.products?.products?.length ?? res?.products?.products?.length ?? 0
      const facetsCount = res?.data?.products?.attributeValues?.length ?? res?.products?.attributeValues?.length ?? 0

      console.log(
        `[SDK GQL ✓] ${op} → ${ms}ms vars:${bytesFmt(varsBytes)} res:${bytesFmt(resBytes)}` +
        (productsCount || facetsCount ? ` items:${productsCount} facets:${facetsCount}` : '')
      )

      return res
    } catch (err: any) {
      const ms = now() - t0
      console.error(`[SDK GQL ⨯] ${op} → ${ms}ms`, err?.message || err)
      throw err
    }
  }) as OdooQueryFn

  // helpers
  function now() { return (typeof performance !== 'undefined' && performance.now) ? Math.round(performance.now()) : Date.now() }
  function safeLen(obj: any) { try { return JSON.stringify(obj ?? {}).length } catch { return 0 } }
  function bytesFmt(n: number) {
    if (!n) return '0B'
    if (n < 1024) return `${n}B`
    const kb = n / 1024
    if (kb < 1024) return `${kb.toFixed(1)}KB`
    const mb = kb / 1024
    return `${mb.toFixed(1)}MB`
  }
})
