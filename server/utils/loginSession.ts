import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'

const LOGIN_SESSION_COOKIE = 'login-session'
const SESSION_COOKIE = 'session_id'
const USER_COOKIE = 'odoo-user'

const hashSessionId = (sessionId: string) =>
  createHash('sha256').update(sessionId).digest('base64url')

export const sessionIdFromSetCookies = (cookies: string[]) =>
  cookies
    .find(cookie => cookie.startsWith(`${SESSION_COOKIE}=`))
    ?.split(';')[0]
    ?.slice(SESSION_COOKIE.length + 1)

export const setLoginSession = (event: H3Event, sessionId: string) => {
  setCookie(event, LOGIN_SESSION_COOKIE, hashSessionId(sessionId), {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  })
}

export const clearLoginSession = (event: H3Event) => {
  deleteCookie(event, LOGIN_SESSION_COOKIE, { path: '/' })
}

export const isLoginSessionValid = (event: H3Event) => {
  const sessionId = getCookie(event, SESSION_COOKIE)
  const loginSession = getCookie(event, LOGIN_SESSION_COOKIE)

  return Boolean(getCookie(event, USER_COOKIE))
    && Boolean(sessionId && sessionId !== 'undefined')
    && Boolean(loginSession)
    && hashSessionId(sessionId!) === loginSession
}

export const clearStorefrontLogin = (event: H3Event) => {
  clearLoginSession(event)
  deleteCookie(event, USER_COOKIE, { path: '/' })
}
