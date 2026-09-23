// Page metadata: title, URL, SEO. Block content goes through draft.put.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody<{
    title?: string
    slug?: string
    metaTitle?: string
    metaDescription?: string
  }>(event)

  return cmsStore.updateMeta(id, body ?? {})
})
