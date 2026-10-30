/**
 * Which products match a search, asked of Algolia.
 *
 * Algolia only decides what matches and in what order. The products
 * themselves - prices, stock, images, facets, sorting, pagination - still
 * come from Odoo, filtered to the ids Algolia returned, so a hit always shows
 * what the shop would show for that product anywhere else.
 *
 * The index needs one record per product template, with the template's Odoo
 * id in `id` (or as the objectID) and whatever attributes it should be
 * searched on. Search is on Odoo, not Algolia, unless public.algolia is fully
 * configured; see nuxt.config.
 */

interface AlgoliaConfig {
  enabled?: string | number | boolean
  applicationId?: string
  searchApiKey?: string
  indexName?: string
  host?: string
}

interface AlgoliaHit {
  objectID: string
  id?: number | string
}

/**
 * Turned on, and given everything a query needs. `enabled` comes from the
 * environment, which Nuxt parses: NUXT_PUBLIC_ALGOLIA_ENABLED=1 arrives as
 * the number 1, `true` as a boolean.
 */
export function isTurnedOn(enabled: AlgoliaConfig['enabled']) {
  return ['1', 'true'].includes(String(enabled).toLowerCase())
}

export function isAlgoliaConfigured(config?: AlgoliaConfig) {
  return !!config
    && isTurnedOn(config.enabled)
    && !!config.applicationId
    && !!config.searchApiKey
    && !!config.indexName
}

/** The product template id a record stands for, if it has one. */
export function hitProductId(hit: AlgoliaHit) {
  const id = Number(hit.id ?? hit.objectID)
  return Number.isInteger(id) && id > 0 ? id : null
}

let warnedAboutConfig = false

export function useAlgolia() {
  const config = useRuntimeConfig().public.algolia as AlgoliaConfig | undefined
  const enabled = isAlgoliaConfigured(config)

  // Turned on and missing a value is a deploy mistake worth one line, not a
  // broken search: Odoo answers instead.
  if (isTurnedOn(config?.enabled) && !enabled && !warnedAboutConfig) {
    warnedAboutConfig = true
    console.warn('[search] NUXT_PUBLIC_ALGOLIA_ENABLED is set but the Algolia application, search key or index is missing: searching Odoo instead.')
  }

  /**
   * Ids of the product templates matching `query`, best match first.
   * Null when Algolia could not be asked, so the caller can fall back to
   * Odoo rather than show no results.
   */
  async function productIds(query: string, hitsPerPage: number): Promise<number[] | null> {
    if (!enabled || !config) return null

    const host = config.host || `https://${config.applicationId}-dsn.algolia.net`
    try {
      const response = await $fetch<{ hits: AlgoliaHit[] }>(
        `${host.replace(/\/+$/, '')}/1/indexes/${encodeURIComponent(config.indexName!)}/query`,
        {
          method: 'POST',
          headers: {
            'x-algolia-application-id': config.applicationId!,
            'x-algolia-api-key': config.searchApiKey!,
          },
          body: {
            query,
            hitsPerPage,
            attributesToRetrieve: ['id'],
            attributesToHighlight: [],
            attributesToSnippet: [],
          },
        },
      )
      return (response.hits ?? [])
        .map(hitProductId)
        .filter((id): id is number => id !== null)
    }
    catch (error: any) {
      console.warn('[search] Algolia did not answer, searching Odoo instead:', error?.message ?? error)
      return null
    }
  }

  return { enabled, productIds }
}

/** `items` in the order of `ids`, for Algolia's ranking. */
export function sortByIds<T extends { id?: number | null }>(items: T[], ids: number[]) {
  const rank = new Map(ids.map((id, index) => [id, index]))
  return [...items].sort((a, b) =>
    (rank.get(a.id ?? -1) ?? Infinity) - (rank.get(b.id ?? -1) ?? Infinity))
}
