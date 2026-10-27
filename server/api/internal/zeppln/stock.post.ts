import { readZepplnBody } from '../../../utils/zepplnSecurity'

/**
 * Stock from Odoo, on Zeppln, where Odoo cannot reach this storefront's Redis:
 * `{"stock": {"<product id>": {"<website id>": qty}}}`, written to the
 * `stock:product-<id>` entries Odoo writes itself elsewhere.
 */
export default defineEventHandler(async (event) => {
  const { stock } = await readZepplnBody<{ stock?: Record<string, Record<string, number>> }>(event)
  const entries = Object.entries(stock ?? {}).filter(([id]) => /^\d+$/.test(id))

  const storage = useStorage('stock')
  await Promise.all(entries.map(([id, byWebsite]) =>
    storage.setItem(`stock:product-${id}`, JSON.stringify(byWebsite)),
  ))

  return { ok: true, count: entries.length }
})
