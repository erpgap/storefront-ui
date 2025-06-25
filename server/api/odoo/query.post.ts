import hasher from 'object-hash'
import type { Partner } from '~/graphql'
import { Queries } from '~/server/queries'

const customCache = cachedFunction(
  async (event: any) => {
    const config = useRuntimeConfig(event)
    const body = await readBody(event)

    const response: any = await $fetch.raw(`${config.public.odooBaseUrl}graphql/vsf`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'REAL-IP': getRequestIP(event) || '',
        'resquest-host': config.public.middlewareUrl || getRequestHost(event),
        'Cookie': `session_id=${getCookie(event, 'session_id')}`,
      },
      body: JSON.stringify({ query: Queries[body?.[0]?.queryName], variables: body?.[1] }),
    })

    return response
  },
  {
    maxAge: Number(process.env?.NUXT_SWR_CACHE_TIME || 3600),
    staleMaxAge: Number(process.env?.NUXT_SWR_CACHE_TIME || 3600),
    getKey: async (event) => {
      const body = await readBody(event)

      const session = await useSession(event, {
        password: 'b013b03ac2231e0b448e9a22ba488dcf',
      })
      const keyName = `cache:partner:${session?.id}`

      const currentPartnerPricelist
        = (await useStorage().getItem<Partner>(keyName)) || ({} as Partner)

      const isoCode = getCookie(event, 'country-iso-code') || 'us'

      const pricelist = currentPartnerPricelist?.id
        ? `-pricelist${currentPartnerPricelist?.id}`
        : ''

      const hashedParams = hasher(body?.[1] || {})

      return `${body?.[0].queryName}-${hashedParams}-${isoCode}-${pricelist}`
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

    if (response?._data?.errors?.length > 0) {
      throw createError({
        statusCode: 500,
        data: response?._data?.errors,
        message: response?._data?.errors?.[0]?.message,
      })
    }

    return response?._data?.data
  }
  catch (error: any) {
    if (error?.response?._data?.errors?.length > 0) {
      throw createError({
        statusCode: 500,
        data: error.response?._data?.errors,
        message: error.response?._data?.errors?.[0]?.message,
      })
    }
    if (error.graphQLErrors?.length > 0) {
      throw createError({
        statusCode: 500,
        data: error.graphQLErrors,
        message: error.message,
      })
    }
    if (error.protocolErrors?.length > 0) {
      throw createError({
        statusCode: 400,
        data: error.protocolErrors,
        message: error.message,
      })
    }
    if (error.clientErrors?.length > 0) {
      throw createError({
        statusCode: 400,
        data: error.clientErrors,
        message: error.message,
      })
    }
    if (error.networkError) {
      throw createError({
        statusCode: 500,
        data: (error.networkError as unknown)?.result?.errors,
        message: error.message,
      })
    }

    throw createError({
      statusCode: 500,
      data: error?.data,
      message: error.data?.[0]?.message,
    })
  }
})
