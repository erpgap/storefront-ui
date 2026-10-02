export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const page = await store.unpublish(getRouterParam(event, 'id')!)

  // Taking a page down is as visitor-facing as putting one up: without this
  // the cached copy keeps serving a page the merchant has hidden.
  await invalidateCmsPageCache(page.slug)

  return page
})
