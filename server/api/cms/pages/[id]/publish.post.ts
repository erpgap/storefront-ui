import { validateBlocks } from '#shared/cms/blocks'

/**
 * Copy draft over published. Refuses if the draft has validation issues —
 * a required headline left empty should not reach a customer.
 */
export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const id = getRouterParam(event, 'id')!
  const page = await store.get(id)

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found.' })
  }

  const { issues } = validateBlocks(page.draft)
  if (issues.length) {
    throw createError({
      statusCode: 422,
      statusMessage: 'This page has problems that must be fixed before publishing.',
      data: { issues },
    })
  }

  const published = await store.publish(id)

  // Purged here, inline, by the side that owns the cache. Without it the
  // merchant publishes, reloads, sees the old page and reports it as a bug.
  await invalidateCmsPageCache(published.slug)

  return published
})
