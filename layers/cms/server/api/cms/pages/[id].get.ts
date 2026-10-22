// Full page, draft included. Editor-only — the storefront uses /api/cms/published.
export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const id = getRouterParam(event, 'id')!
  const page = await store.get(id)

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found.' })
  }

  return page
})
