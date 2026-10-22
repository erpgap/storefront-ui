export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const id = getRouterParam(event, 'id')!

  // Read the slug before the page is gone - afterwards there is nothing left
  // to derive the cache key from, and the deleted page would keep serving.
  const page = await store.get(id).catch(() => null)

  await store.remove(id)

  if (page?.slug) await invalidateCmsPageCache(page.slug)

  return { ok: true }
})
