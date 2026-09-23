export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  await store.remove(getRouterParam(event, 'id')!)
  return { ok: true }
})
