import type { Ref } from 'vue'
import type { LocationQueryRaw } from 'vue-router'
import type { AttributeValue, CustomProductWithStockFromRedis } from '~~/graphql'
import {
  getVariantAxisNames,
  resolveCombinationIds,
} from '~~/layers/product/utils'

type ColorOption = { id: number; label: string }

/**
 * Manages variant selection state for a product detail page.
 *
 * Responsibilities:
 * - Derives available color options from the product template's attribute values.
 * - Tracks the currently selected value for each variant axis via the URL query.
 * - Provides `updateVariantQuery` to navigate to a new variant combination while
 *   preserving all other selected axes.
 * - Watches for URL query changes and triggers `onCombinationChange` so the caller
 *   can reload the variant data.
 */
export const useProductVariantSelection = (
  productTemplate: Ref<CustomProductWithStockFromRedis>,
  onCombinationChange: (combinationId: number[]) => Promise<void>,
) => {
  const route = useRoute()

  const variantAxisNames = computed(() =>
    getVariantAxisNames(productTemplate.value),
  )

  const colorOptions = computed<ColorOption[]>(() =>
    (productTemplate.value?.attributeValues ?? [])
      .filter((item: AttributeValue) => item?.attribute?.name === 'Color')
      .map((item: AttributeValue) => ({
        id: Number(item.id),
        label: String(item.name ?? ''),
      })),
  )

  /**
   * The currently selected attribute value ID for each variant axis.
   * Keys are axis names (e.g. "Color", "Size"); values are numeric IDs.
   */
  const selectedValues = computed<Record<string, number>>(() => {
    const result: Record<string, number> = {}
    for (const name of variantAxisNames.value) {
      const raw = route.query[name]
      if (raw == null || raw === '') continue
      const value = Array.isArray(raw) ? raw[0] : raw
      if (typeof value === 'string') {
        const id = Number(value)
        if (id > 0) result[name] = id
      }
    }
    return result
  })

  /**
   * Navigates to a new URL query that merges the current variant axes with the
   * provided `patch`. Preserves axes not mentioned in `patch`.
   */
  const updateVariantQuery = async (patch: LocationQueryRaw) => {
    const query: LocationQueryRaw = {}

    for (const name of variantAxisNames.value) {
      const value = route.query[name]
      if (value != null && value !== '') {
        query[name] = value as string
      }
    }

    Object.assign(query, patch)

    await navigateTo({ query })
  }

  watch(
    () => variantAxisNames.value.map(name => route.query[name]),
    async () => {
      if (!productTemplate.value?.id) return
      const combinationId = resolveCombinationIds(productTemplate.value, route.query)
      await onCombinationChange(combinationId)
    },
  )

  return {
    variantAxisNames,
    colorOptions,
    selectedValues,
    updateVariantQuery,
  }
}
