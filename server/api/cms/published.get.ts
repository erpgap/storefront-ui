/**
 * The storefront read path. Published blocks only, by URL.
 *
 * Deliberately separate from the editor endpoints: this is the one CMS route a
 * visitor's request ever touches, it never exposes draft content, and it is the
 * route that would carry an SWR cache rule in production.
 */
export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const slug = String(getQuery(event).slug ?? '')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'slug is required' })
  }

  const page = await store.getPublishedBySlug(slug)
  if (!page) return null

  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    blocks: page.publishedBlocks,
    publishedAt: page.publishedAt,
  }
})
