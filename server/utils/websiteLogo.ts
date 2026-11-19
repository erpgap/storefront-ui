import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'
import { imageSize } from './imageSize'

export interface WebsiteLogo {
  type: string
  // base64: the function cache stores JSON
  body: string
  width: number
  height: number
  // Changes with the image, for a URL browsers can keep for good.
  version: string
  // The website's name, the logo's text alternative.
  name: string
}

/**
 * The logo of the Odoo website this request belongs to, as the merchant sets
 * it in Odoo (Website > Settings > Logo), with the size the page needs to
 * keep its place before it loads.
 *
 * Kept an hour per host, as the header menu is; a failed fetch is not kept.
 * Null without a website, a logo or a size it can read: the storefront then
 * shows its own text logo.
 */
export const websiteLogo = cachedFunction(async (event: H3Event): Promise<WebsiteLogo | null> => {
  const website = await odooWebsite(event)
  if (!website) return null

  const odooBaseUrl = useRuntimeConfig().public.odooBaseUrl
  const response = await $fetch.raw<ArrayBuffer>(
    `${odooBaseUrl}/web/image/website/${website.id}/logo`,
    { responseType: 'arrayBuffer', timeout: 5000 },
  ).catch(() => null)

  const type = (response?.headers.get('content-type') || '').split(';')[0]!.trim()
  if (!response?._data?.byteLength || !type.startsWith('image/')) return null
  const data = new Uint8Array(response._data)
  const size = imageSize(data)
  if (!size) return null
  return {
    type,
    body: Buffer.from(data).toString('base64'),
    ...size,
    version: createHash('sha1').update(data).digest('hex').slice(0, 12),
    name: website.name,
  }
}, {
  name: 'odoo-logo',
  maxAge: Number(process.env.NUXT_SWR_CACHE_TIME || 3600),
  swr: true,
  validate: entry => !!entry.value,
  getKey: (event: H3Event) => getRequestHost(event).replace(/\W/g, '') || 'default',
})
