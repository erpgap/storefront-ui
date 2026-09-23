import { validateBlocks } from '#shared/cms/blocks'

/**
 * Copy draft over published. Refuses if the draft has validation issues —
 * a required headline left empty should not reach a customer.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const page = await cmsStore.get(id)

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

  const published = await cmsStore.publish(id)

  // Where the real implementation also fires cache invalidation for the page's
  // URL (§6.5). Skipping it means merchants publish, reload, see stale SWR
  // content, and report it as a bug.
  return published
})
