import { Queries, type QueryName } from '~~/server/queries'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<[{ queryName: QueryName }, Record<string, unknown>?]>(event)
    const response = await odooGraphqlRaw(
      event, Queries[body?.[0]?.queryName], body?.[1], { session: true },
    )
    if (response?._data?.errors?.length) throw odooProxyError(response)
    return response?._data?.data
  }
  catch (error: any) {
    throw odooProxyError(error)
  }
})
