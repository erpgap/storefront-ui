import { createOdooCmsStore } from '~~/server/utils/cmsOdooStore'

/**
 * Bring an older version back.
 *
 * Copies it forward into a new revision and makes that live, rather than
 * moving a pointer backwards - so history stays append-only. The draft is
 * reset to match; the studio warns first if it holds unpublished work.
 */
export default defineEventHandler(async (event) => {
  if (process.env.NUXT_CMS_BACKEND === 'file') {
    throw createError({
      statusCode: 501,
      statusMessage: 'Version history needs the Odoo backend.',
    })
  }

  const body = await readBody<{ revisionId?: string | number }>(event)
  if (!body?.revisionId) {
    throw createError({ statusCode: 400, statusMessage: 'revisionId is required' })
  }

  return createOdooCmsStore(event).restore(
    getRouterParam(event, 'id')!,
    String(body.revisionId),
  )
})
