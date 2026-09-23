export default defineEventHandler(async (event) => {
  await cmsStore.remove(getRouterParam(event, 'id')!)
  return { ok: true }
})
