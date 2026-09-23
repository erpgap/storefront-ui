export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  return store.unpublish(getRouterParam(event, 'id')!)
})
