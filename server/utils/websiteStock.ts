/**
 * A product's stock for one website, from the `stock:product-<id>` entry Odoo
 * writes to Redis: free quantity keyed by website id, e.g. {"1": 4, "2": 0}.
 *
 * Without a website id (Odoo could not say) a single-website entry is still
 * read; with several websites and no id there is no right answer, so 0.
 */
export function stockForWebsite(stock: unknown, websiteId: number | null | undefined): number {
  if (!stock || typeof stock !== 'object') return 0
  const byWebsite = stock as Record<string, unknown>
  const value = websiteId != null && String(websiteId) in byWebsite
    ? byWebsite[String(websiteId)]
    : Object.keys(byWebsite).length === 1 ? Object.values(byWebsite)[0] : 0
  return Number(value) || 0
}
