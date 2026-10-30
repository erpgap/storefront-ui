import hasher from 'object-hash'
import type { Partner } from '~~/graphql'
import { Queries, type QueryName } from '~~/server/queries'

// Part of the cache key: a query whose fields change is a new entry, not the
// old answer served until it expires (a deploy does not clear this cache).
const queryVersions: Record<string, string> = Object.fromEntries(
  Object.entries(Queries).map(([name, query]) => [name, hasher(query).slice(0, 8)]),
)

const customCache = cachedFunction(
  async (event: any) => {
    const body = await readBody<[{ queryName: QueryName }, Record<string, unknown>?]>(event)

    const response: any = await odooGraphqlRaw(
      event, Queries[body?.[0]?.queryName], body?.[1], { session: true },
    )

    return response
  },
  {
    maxAge: Number(process.env?.NUXT_SWR_CACHE_TIME || 3600),
    staleMaxAge: Number(process.env?.NUXT_SWR_CACHE_TIME || 3600),
    getKey: async (event) => {
      const body = await readBody(event)
      const session = await useStorefrontSession(event)
      const keyName = `cache:partner:${session?.id}`

      const currentPartnerPricelist
        = (await useStorage().getItem<Partner>(keyName)) || ({} as Partner)

      const isoCode = getCookie(event, 'country-iso-code') || 'us'

      const pricelist = currentPartnerPricelist?.id
        ? `-pricelist${currentPartnerPricelist?.id}`
        : ''

      const hashedParams = hasher(body?.[1] || {})

      const queryName = body?.[0].queryName
      return `${queryName}-${queryVersions[queryName] ?? ''}-${hashedParams}-${isoCode}-${pricelist}`
    },
    shouldBypassCache: async (event) => {
      const config = useRuntimeConfig(event)
      const body = await readBody(event)

      const checkIfQueryNameIsEqual = (queryName: string) =>
        queryName === body?.[0].queryName

      if (config?.shouldByPassCacheQueryNames?.some(checkIfQueryNameIsEqual)) {
        return true
      }

      return false
    },
  },
)

export default defineEventHandler(async (event) => {
  try {
    const response: any = await customCache(event)
    if (response?._data?.errors?.length) throw odooProxyError(response)
    return response?._data?.data
  }
  catch (error: any) {
    throw odooProxyError(error)
  }
})
