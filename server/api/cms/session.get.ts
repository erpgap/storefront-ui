import { GetCmsCanEditQuery } from '~~/server/queries/CmsQueries'

/**
 * Whether this session may edit content.
 *
 * Asked of Odoo, never inferred here. It drives UI affordances only - the
 * studio redirecting to login rather than showing an empty page - and grants
 * nothing. Every write is authorised again in Odoo against the real user, so
 * a client that lies to itself about this achieves nothing.
 */
export default defineEventHandler(async (event) => {
  if (process.env.NUXT_CMS_BACKEND === 'file') {
    return { canEdit: true, backend: 'file' as const }
  }

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
    return { canEdit: Boolean(response?.data?.cmsCanEdit), backend: 'odoo' as const }
  }
  catch {
    return { canEdit: false, backend: 'odoo' as const }
  }
})
