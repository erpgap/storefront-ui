// Full page, draft included. Studio-only — the storefront uses /api/cms/published.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const page = await cmsStore.get(id)

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found.' })
  }

  return page
})
