import { defineNitroPlugin } from 'nitropack/runtime'

/**
 * On Zeppln (NUXT_ZEPPLN_INIT=true), report this storefront to Odoo when it
 * starts.
 *
 * Odoo only learns the storefront's domain this way - it is known once Zeppln
 * has created the instance - and on that first report sends it every stock
 * and slug (server/api/internal/zeppln). Later starts change nothing in Odoo.
 * NUXT_ZEPPLN_TOKEN, the token of the Odoo website made for this storefront,
 * proves who is calling.
 *
 * Not awaited: the storefront serves meanwhile, and keeps trying while Odoo
 * cannot be reached.
 */
const RETRY_MS = 30_000

export default defineNitroPlugin(() => {
  if (import.meta.prerender) return

  const config = useRuntimeConfig()
  // A string, though Nuxt may hand an overridden value over parsed.
  if (String(config.zepplnInit) !== 'true') return

  if (!config.zepplnToken) {
    console.error('[zeppln] NUXT_ZEPPLN_INIT is true but NUXT_ZEPPLN_TOKEN is empty: not reporting to Odoo.')
    return
  }

  const url = `${String(config.public.odooBaseUrl).replace(/\/+$/, '')}/alokai/saas/instance`

  const report = async () => {
    try {
      const result = await $fetch<{ status: string }>(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.zepplnToken}` },
        body: { domain: config.public.middlewareUrl },
      })
      console.info(`[zeppln] Reported to Odoo: ${result.status}.`)
    }
    catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status
      if (status === 400 || status === 401) {
        // Retrying would not change the answer.
        console.error(`[zeppln] Odoo refused the report (${status}): check NUXT_ZEPPLN_TOKEN.`)
        return
      }
      console.warn(`[zeppln] Could not reach Odoo, retrying in ${RETRY_MS / 1000}s: ${(error as Error).message}`)
      setTimeout(report, RETRY_MS)
    }
  }

  report()
})
