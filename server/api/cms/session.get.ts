import { GetCmsCanEditQuery } from '~~/server/queries/CmsQueries'

/**
 * Whether this session may edit content.
 *
 * Asked of Odoo, never inferred here. It drives UI affordances only - the
 * editor redirecting to login rather than showing an empty page - and grants
 * nothing. Every write is authorised again in Odoo against the real user, so
 * a client that lies to itself about this achieves nothing.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const url = new URL('/graphql/vsf', config.public.odooBaseUrl).toString()

  try {
    const response = await $fetch<{ data?: { cmsCanEdit?: boolean } }>(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Cookie': `session_id=${getCookie(event, 'session_id') ?? ''}`,
      },
      body: { query: GetCmsCanEditQuery },
    })
    return { canEdit: Boolean(response?.data?.cmsCanEdit) }
  }
  catch {
    return { canEdit: false }
  }
})
