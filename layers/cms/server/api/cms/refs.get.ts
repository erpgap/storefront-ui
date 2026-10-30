import { GetCmsCategoriesQuery, GetCmsProductsQuery } from '#cms/server/queries/CmsQueries'

/**
 * Options for the product and category pickers.
 *
 * Group-gated in Odoo, and it returns names and images for display only - the
 * block stores ids and nothing else. A cached product name is a product name
 * that goes stale, and keeping only the reference is the whole reason this
 * content lives in Odoo rather than a headless CMS.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const kind = String(query.kind ?? 'product')
  const search = String(query.search ?? '')
  // `''.split(',')` yields [''], which Number() turns into 0 - and
  // Number.isInteger(0) is true, so an empty parameter became a search for
  // record id 0 and quietly returned nothing.
  const ids = String(query.ids ?? '')
    .split(',')
    .map(Number)
    .filter(id => Number.isInteger(id) && id > 0)

  const response = await odooGraphql<{ cmsProducts?: unknown[], cmsCategories?: unknown[] }>(
    event,
    kind === 'category' ? GetCmsCategoriesQuery : GetCmsProductsQuery,
    kind === 'category' ? { search } : { search, ids: ids.length ? ids : null },
    { session: true },
  )

  if (response?.errors?.length) {
    throw createError({ statusCode: 403, statusMessage: response.errors[0]!.message })
  }

  const options = (response.data?.cmsCategories ?? response.data?.cmsProducts ?? []) as
    { id: number, name: string, imageUrl?: string }[]

  // Odoo returns a path relative to itself. The storefront is a different
  // origin, so it has to be made absolute or every thumbnail in the picker
  // renders broken.
  const config = useRuntimeConfig(event)
  const base = String(config.public.odooBaseImageUrl || config.public.odooBaseUrl || '')
    .replace(/\/$/, '')

  return options.map(option => ({
    ...option,
    imageUrl: option.imageUrl ? `${base}${option.imageUrl}` : undefined,
  }))
})
