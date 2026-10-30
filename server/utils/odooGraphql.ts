// Every server call to Odoo's GraphQL endpoint goes through here, so the URL,
// the headers and the error a browser gets back are decided once.

import type { H3Event } from 'h3'

export interface OdooGraphqlResponse<T> {
  data?: T
  errors?: { message: string }[]
}

/** Joined as shared/url.mjs says: the base URL has no trailing slash. */
export function odooGraphqlUrl(event?: H3Event) {
  return `${useRuntimeConfig(event).public.odooBaseUrl}/graphql/vsf`
}

/**
 * request-host tells graphql_alokai which Odoo website the call is for: it is
 * matched against each website's Domain and scopes catalogue, prices and CMS
 * pages to it. Without it Odoo falls back to its first website - fine with
 * one, wrong with several. The public storefront URL when configured, else
 * the host this request came in on.
 *
 * `session` forwards the visitor's Odoo session cookie. Reads that must not
 * vary by visitor (website, locales, regions, sitemaps) leave it out.
 */
export function odooHeaders(event: H3Event, { session = false } = {}): Record<string, string> {
  return {
    'accept': 'application/json',
    'content-type': 'application/json',
    'request-host': String(useRuntimeConfig(event).public.middlewareUrl || getRequestHost(event)),
    'REAL-IP': getRequestIP(event) || '',
    ...(session ? { Cookie: `session_id=${getCookie(event, 'session_id') ?? ''}` } : {}),
  }
}

/** The response with its headers, for callers that pass Odoo's cookies on. */
export function odooGraphqlRaw<T>(
  event: H3Event,
  query: string,
  variables?: Record<string, unknown>,
  options: { session?: boolean } = {},
) {
  return $fetch.raw<OdooGraphqlResponse<T>>(odooGraphqlUrl(event), {
    method: 'POST',
    headers: odooHeaders(event, options),
    body: { query, variables },
  })
}

export function odooGraphql<T>(
  event: H3Event,
  query: string,
  variables?: Record<string, unknown>,
  options: { session?: boolean } = {},
) {
  return $fetch<OdooGraphqlResponse<T>>(odooGraphqlUrl(event), {
    method: 'POST',
    headers: odooHeaders(event, options),
    body: { query, variables },
  })
}

/**
 * What /api/odoo/* answer when Odoo fails: a 500 whose message is Odoo's own
 * first GraphQL error (the storefront shows it as data.message), whether Odoo
 * sent it with a 200 or an error status. Never ofetch's "[POST] <odoo url>"
 * wrapper, which would show a shopper the internal address.
 */
export function odooProxyError(error: any) {
  if (isError(error)) return error
  const errors = error?.response?._data?.errors ?? error?._data?.errors
  if (errors?.length) {
    return createError({ statusCode: 500, data: errors, message: errors[0]?.message })
  }
  console.error('Odoo request failed:', error?.message ?? error)
  return createError({ statusCode: 500, data: error?.data, message: error?.data?.[0]?.message })
}
