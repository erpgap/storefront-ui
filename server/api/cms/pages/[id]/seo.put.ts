import { isLocaleCode } from '#shared/cms/i18n'

/**
 * Save a page's meta title and description for one language.
 *
 * Separate from the PATCH route because SEO is per language and that route's
 * fields are not. An empty value removes that language's text, so it falls
 * back to the default language rather than rendering blank. For the homepage
 * Odoo writes the website record's tags, which is what / renders.
 */
export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody<{
    lang?: string
    metaTitle?: string
    metaDescription?: string
    metaImage?: string | null
  }>(event)

  const lang = String(body?.lang ?? '')
  if (!isLocaleCode(lang)) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown language.' })
  }

  const text = (value: unknown) =>
    value === undefined || value === null ? undefined : String(value)

  const page = await store.saveSeo(id, lang, {
    metaTitle: text(body?.metaTitle),
    metaDescription: text(body?.metaDescription),
    // null removes the image, a media library URL replaces it.
    metaImage: body?.metaImage === null ? null : text(body?.metaImage),
  })

  // The tags are part of the cached HTML, so a save must purge it.
  await invalidateCmsPageCache(page.slug)

  return page
})
