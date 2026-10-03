import { GetCmsRegionQuery } from '~~/server/queries/CmsQueries'

/**
 * Published blocks for a storefront region.
 *
 * Separate from the page read because a region is requested on pages a
 * visitor browses constantly - every category, every product - so it is the
 * one CMS call that needs to be cheap and cacheable.
 */
export default defineEventHandler(async (event) => {
  const key = String(getQuery(event).key ?? '')
  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'key is required' })
  }

  if (process.env.NUXT_CMS_BACKEND === 'file') return null

  const config = useRuntimeConfig(event)
  const url = new URL('/graphql/vsf', config.public.odooBaseUrl).toString()

  try {
    const response = await $fetch<{
      data?: { cmsRegion?: { id: number, blocks?: unknown[] } | null }
    }>(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: { query: GetCmsRegionQuery, variables: { key } },
    })

    const region = response?.data?.cmsRegion
    return region ? { id: region.id, blocks: region.blocks ?? [] } : null
  }
  catch {
    // A region that fails to load is an absent addition, not a broken page.
    return null
  }
})
