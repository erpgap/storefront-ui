/**
 * A product's stock for one website, from the `stock:product-<id>` entry Odoo
 * writes to Redis: free quantity keyed by website id, e.g. {"1": 4, "2": 0}.
 *
 * Without a website id (an addon without the `website` query, or Odoo
 * unreachable) it reads website 1, which is what every read did before and
 * the website Odoo serves when no Domain matches, then a single-website
 * entry. Only when neither applies is it 0 rather than another store's stock.
 */
export function stockForWebsite(stock: unknown, websiteId: number | null | undefined): number {
  if (!stock || typeof stock !== 'object') return 0
  const byWebsite = stock as Record<string, unknown>
  const keys = Object.keys(byWebsite)

  let key: string | undefined
  if (websiteId != null) key = String(websiteId)
  else if ('1' in byWebsite) key = '1'
  else if (keys.length === 1) key = keys[0]

  return key !== undefined && key in byWebsite ? Number(byWebsite[key]) || 0 : 0
}
