// Page metadata: title, URL, SEO. Block content goes through draft.put.
export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody<{
    title?: string
    slug?: string
    metaTitle?: string
    metaDescription?: string
  }>(event)

  return store.updateMeta(id, body ?? {})
})
