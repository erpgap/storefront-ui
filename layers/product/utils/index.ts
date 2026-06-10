import type { LocationQuery } from 'vue-router'
import type { Product } from '~~/graphql'

/**
 * Returns the unique variant axis names (e.g. ["Color", "Size"]) from a product
 * template's `attributeValues`. These are the URL query-param keys used to identify
 * which variant the customer selected.
 */
export const getVariantAxisNames = (product: Product): string[] => {
  const names = product?.attributeValues
    ?.map(attributeValue => attributeValue?.attribute?.name)
    ?.filter((name): name is string => Boolean(name)) ?? []

  return [...new Set(names)]
}

/**
 * Extracts combination attribute value IDs from the current URL query,
 * matching only the keys that correspond to variant axes.
 */
export const getCombinationIdsFromQuery = (
  query: LocationQuery,
  axisNames: string[],
): number[] => {
  const combinationIds: number[] = []

  for (const name of axisNames) {
    const raw = query[name]
    if (raw == null || raw === '') continue

    const value = Array.isArray(raw) ? raw[0] : raw
    if (typeof value !== 'string') continue

    const id = Number(value)
    if (id > 0) combinationIds.push(id)
  }

  return combinationIds
}

/**
 * Returns the default combination IDs from the product's `firstVariant`
 * (or the product itself when `firstVariant` is absent).
 */
export const getDefaultCombinationIds = (product: Product): number[] => {
  return product?.variantAttributeValues
    ?.map(av => Number(av?.id))
    ?.filter(id => id > 0) ?? []
}

/**
 * Resolves the full set of attribute value IDs required by `GetProductVariantQuery`.
 *
 * Priority:
 *   1. All variant axis values present in the URL query (e.g. ?Size=824&Color=822 → [824, 822])
 *   2. Fallback: the default variant combination from `firstVariant`
 *
 * A partial query (only one axis supplied when the product has multiple) is intentionally
 * skipped so the API never receives an incomplete combination that would return 404.
 */
export const resolveCombinationIds = (
  product: Product,
  query: LocationQuery,
): number[] => {
  const axisNames = getVariantAxisNames(product)
  const fromQuery = getCombinationIdsFromQuery(query, axisNames)

  const allAxesCovered = axisNames.length > 0 && fromQuery.length === axisNames.length
  if (allAxesCovered) return fromQuery

  return getDefaultCombinationIds(product?.firstVariant ?? product)
}

/**
 * Builds the product detail page URL from a variant's `slug` and its
 * `variantAttributeValues`, e.g. `/product/classic-suit-180?Size=824&Color=822`.
 */
export const mountUrlSlugForProductVariant = (product: Product): string => {
  const slug = product?.slug ?? ''

  const variantAttributeValues = product?.variantAttributeValues ?? []
  if (variantAttributeValues.length === 0) return slug

  const params = new URLSearchParams()
  for (const av of variantAttributeValues) {
    const name = av?.attribute?.name
    const id = av?.id
    if (name && id != null) params.append(name, String(id))
  }

  return `${slug}?${params.toString()}`
}
