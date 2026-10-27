import { readZepplnBody } from '../../../utils/zepplnSecurity'

type SlugChanges = { model: string, set?: string[], delete?: string[] }

const isSlugKey = (key: unknown): key is string => typeof key === 'string' && key.startsWith('slug:')

/**
 * Slug keys from Odoo, on Zeppln, where Odoo cannot reach this storefront's
 * Redis: `{"slugs": [{"model", "set": [keys], "delete": [keys]}]}`, as Odoo's
 * sync_slug_keys writes them elsewhere. The keys come encoded by Odoo, so they
 * match the ones it writes itself.
 */
export default defineEventHandler(async (event) => {
  const { slugs } = await readZepplnBody<{ slugs?: SlugChanges[] }>(event)
  const storage = useStorage('slug')
  let count = 0

  for (const { model, set = [], delete: gone = [] } of slugs ?? []) {
    // A key now owned by another model is not this one's to remove.
    await Promise.all(gone.filter(isSlugKey).map(async (key) => {
      if (await storage.getItem(key) === model) await storage.removeItem(key)
    }))
    // ttl 0: the slug mount expires what it caches after NUXT_SWR_CACHE_TIME,
    // and a page whose key expired would answer 404.
    const keys = set.filter(isSlugKey)
    await Promise.all(keys.map(key => storage.setItem(key, model, { ttl: 0 })))
    count += keys.length
  }

  return { ok: true, count }
})
