import { Mutations, type MutationName } from '~~/server/mutations'

export default defineEventHandler(async (event) => {
  const body = await readBody<[{ mutationName: MutationName }, Record<string, unknown>?]>(event)

  try {
    const response = await odooGraphqlRaw(
      event, Mutations[body?.[0]?.mutationName], body?.[1], { session: true },
    )

    const cookies: string[] = response?.headers?.getSetCookie()
    const hasSessionIdOnRequest = cookies.some((cookie: string) => cookie.includes('session_id'))

    if (!hasSessionIdOnRequest) {
      setCookie(event, 'session_id', getCookie(event, 'session_id') as string)
    }

    cookies?.forEach((cookie: string) => {
      appendResponseHeader(event, 'set-cookie', cookie)
    })

    if (body?.[0]?.mutationName === 'LogoutMutation') {
      deleteCookie(event, 'session_id')
      clearLoginSession(event)
    }

    if (response?._data?.errors?.length) throw odooProxyError(response)

    if (['LoginMutation', 'RegisterUserMutation'].includes(body?.[0]?.mutationName)) {
      const sessionId = sessionIdFromSetCookies(cookies ?? []) || getCookie(event, 'session_id')
      if (sessionId) setLoginSession(event, sessionId)
    }

    return response?._data?.data
  }
  catch (error: any) {
    throw odooProxyError(error)
  }
})
