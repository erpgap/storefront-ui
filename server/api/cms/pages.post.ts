import { seedBlockData } from '#shared/cms/blocks'
import { DEFAULT_LOCALE } from '#shared/cms/i18n'
import type { BlockInstance } from '#shared/cms/blocks'

/**
 * Create a page. A brand-new page starts with a hero block rather than an empty
 * canvas — an empty canvas reads as "broken" to a merchant, and the first thing
 * they do is add a hero anyway.
 */
export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const body = await readBody<{ title?: string, slug?: string, blank?: boolean }>(event)

  const title = String(body?.title ?? '').trim()
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'A page title is required.' })
  }

  const slug = normaliseSlug(body?.slug || title)
  if (slug === '/' || slug.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'That URL is too short.' })
  }

  const starter: BlockInstance[] = body?.blank
    ? []
    : [{
        id: `blk_${Math.random().toString(36).slice(2, 10)}`,
        blockType: 'hero',
        // Translatable fields are per-language maps; the page title seeds the
        // default language only.
        data: { ...seedBlockData('hero'), title: { [DEFAULT_LOCALE]: title } },
      }]

  return store.create({ title, slug }, starter)
})
