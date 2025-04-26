import { Queries } from '~/server/queries'

export default defineEventHandler(async (event: any) => {
  const config = useRuntimeConfig(event)
  try {
    const body = await readBody(event)
    const response: any = await $fetch.raw(`${config.public.odooBaseUrl}graphql/vsf`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'REAL-IP': getRequestIP(event) || '',
        'resquest-host': getRequestHost(event),
        'Cookie': `session_id=${getCookie(event, 'session_id')}`,

      },
      body: JSON.stringify({ query: Queries[body?.[0]?.queryName], variables: body?.[1] }),
    })

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
