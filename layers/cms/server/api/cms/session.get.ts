import { GetCmsCanEditQuery } from '#cms/server/queries/CmsQueries'

/**
 * Whether this session may edit content.
 *
 * Asked of Odoo, never inferred here. It drives UI affordances only - the
 * editor redirecting to login rather than showing an empty page - and grants
 * nothing. Every write is authorised again in Odoo against the real user, so
 * a client that lies to itself about this achieves nothing.
 */
export default defineEventHandler(async (event) => {
  try {
    const response = await odooGraphql<{ cmsCanEdit?: boolean }>(
      event, GetCmsCanEditQuery, undefined, { session: true },
    )
    return { canEdit: Boolean(response?.data?.cmsCanEdit) }
  }
  catch {
    return { canEdit: false }
  }
})
