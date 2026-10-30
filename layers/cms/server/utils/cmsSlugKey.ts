/**
 * Tells the storefront's router at once that a published page lives at `slug`.
 *
 * Every address the build did not know is resolved through its `slug:<url>`
 * key, and one without a key is a 404 (app/middleware/dynamic-routes.global.ts).
 * Odoo writes the key for a published page from a cron it triggers after the
 * publish commits, or through Zeppln - up to a second or so after the publish
 * request has returned. A merchant who clicked "View live" in that gap got
 * "Page not found" for the page they had just published.
 *
 * So the side that saw the publish succeed writes the key itself, the same
 * key and value Odoo writes a moment later. Removing keys - unpublish, delete,
 * a moved address - is left to Odoo: a stale key only means the page's own
 * lookup finds nothing, which is a 404 as well.
 */
const CMS_PAGE_MODEL = 'alokai.website.page'

export async function markCmsPageLive(slug: string) {
  const path = String(slug || '').trim()
  if (!path) return
  // ttl 0, as server/api/internal/zeppln/slugs.post.ts explains: the slug
  // mount would otherwise expire it, and the page would answer 404.
  await useStorage('slug').setItem(`slug:${encodeURIComponent(path)}`, CMS_PAGE_MODEL, { ttl: 0 })
}
