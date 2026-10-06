const PLACEHOLDER_WIDTH = '{width}'
const PLACEHOLDER_HEIGHT = '{height}'

export function resolveOdooImageUrl(
  imageUrl: string,
  width: number,
  height: number,
): string {
  return imageUrl
    .replace(PLACEHOLDER_WIDTH, String(width))
    .replace(PLACEHOLDER_HEIGHT, String(height))
}

export function buildOdooImageUrl(
  imageUrl: string | null | undefined,
  width: number,
  height: number,
  baseUrl = '',
): string {
  if (!imageUrl) return ''

  const resolvedPath = resolveOdooImageUrl(imageUrl, width, height)
  const normalizedPath = resolvedPath.startsWith('/')
    ? resolvedPath.slice(1)
    : resolvedPath

  return `${baseUrl}${normalizedPath}`
}

/**
 * An absolute URL for tags read by other sites - og:image and twitter:image.
 *
 * Share crawlers do not resolve relative URLs, and Odoo's /web/image paths do
 * not exist on the storefront's own domain, so those go to the Odoo image
 * host. Any other path is a storefront asset and goes to `origin`.
 */
export function absoluteImageUrl(
  imageUrl: string | null | undefined,
  odooBaseUrl: string,
  origin: string,
): string {
  if (!imageUrl) return ''
  if (/^https?:\/\//.test(imageUrl)) return imageUrl
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  const base = path.startsWith('/web/') ? odooBaseUrl : origin
  return `${base.replace(/\/$/, '')}${path}`
}
