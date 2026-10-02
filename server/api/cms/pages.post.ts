/**
 * Create a page.
 *
 * A new page starts empty. It previously arrived with a hero already on it,
 * on the reasoning that a blank canvas reads as broken - but it guesses at
 * what the merchant wanted, and a block they have to delete is worse than one
 * they have to add. The empty canvas carries its own instructions instead.
 */
export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const body = await readBody<{ title?: string, slug?: string }>(event)

  const title = String(body?.title ?? '').trim()
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'A page title is required.' })
  }

  const slug = normaliseSlug(body?.slug || title)
  if (slug === '/' || slug.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'That URL is too short.' })
  }

  return store.create({ title, slug }, [])
})
