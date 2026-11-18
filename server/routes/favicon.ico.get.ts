import type { H3Event } from 'h3'

/**
 * The favicon of the Odoo website this request belongs to, set in Odoo
 * (Website > Settings), so each store shows its own.
 *
 * Kept out of the page render: the HTML does not change, browsers ask for
 * /favicon.ico on their own and never wait on it to paint, and the icon is
 * kept for a day per host, so a page never waits on Odoo for it. Without one
 * from Odoo (unreachable, or no website for the host) the storefront's own
 * icon is served, from server/assets.
 */
interface Favicon {
  type: string
  // base64: the function cache stores JSON
  body: string
}

const websiteFavicon = cachedFunction(async (event: H3Event): Promise<Favicon | null> => {
  const website = await odooWebsite(event)
  if (!website) return null

  // The shared config, not the request's: no per-request copy for an icon.
  const odooBaseUrl = useRuntimeConfig().public.odooBaseUrl
  const response = await $fetch.raw<ArrayBuffer>(
    `${odooBaseUrl}/web/image/website/${website.id}/favicon`,
    { responseType: 'arrayBuffer', timeout: 5000 },
  ).catch(() => null)

  const type = response?.headers.get('content-type') || ''
  if (!response?._data?.byteLength || !type.startsWith('image/')) return null
  return { type, body: Buffer.from(response._data).toString('base64') }
}, {
  name: 'odoo-favicon',
  maxAge: 60 * 60 * 24,
  swr: true,
  // A failed fetch is not kept: the next request tries Odoo again.
  validate: entry => !!entry.value,
  getKey: (event: H3Event) => getRequestHost(event).replace(/\W/g, '') || 'default',
})

export default defineEventHandler(async (event) => {
  const favicon = await websiteFavicon(event)
  setResponseHeader(event, 'cache-control', 'public, max-age=86400')

  if (favicon) {
    setResponseHeader(event, 'content-type', favicon.type)
    return Buffer.from(favicon.body, 'base64')
  }
  setResponseHeader(event, 'content-type', 'image/x-icon')
  return await useStorage('assets:server').getItemRaw('favicon.ico')
})
