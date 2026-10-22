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

  // A slug change leaves the OLD url cached and still serving, so capture it
  // before the write and purge both.
  const before = await store.get(id).catch(() => null)

  // Only a changed address is checked: the homepage lives at /, which is a
  // storefront route, and must still be able to save its title and SEO.
  if (body?.slug !== undefined) {
    body.slug = normaliseSlug(body.slug)
    if (body.slug !== before?.slug) assertSlugNotReserved(body.slug)
  }

  const page = await store.updateMeta(id, body ?? {})

  await invalidateCmsPageCache(page.slug)
  if (before?.slug && before.slug !== page.slug) {
    await invalidateCmsPageCache(before.slug)
  }

  return page
})
