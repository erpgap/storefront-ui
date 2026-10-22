// Which Odoo website a CMS request is for.
//
// graphql_alokai resolves the website of every /graphql/vsf request from this
// header, matched against each website's Domain, and scopes CMS pages and
// regions to it. Without the header Odoo falls back to its first website: fine
// with one, but with several every storefront would edit and render the same
// site's pages.
//
// Same value the storefront's own Odoo calls send (server/api/odoo): the
// public storefront URL when configured, else the host this request came in on.

import type { H3Event } from 'h3'

export function odooWebsiteHeaders(event: H3Event): Record<string, string> {
  const host = useRuntimeConfig(event).public.middlewareUrl || getRequestHost(event)
  return { 'request-host': String(host) }
}
