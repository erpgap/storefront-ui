import { storefrontRouteFor } from './cmsReservedRoutes'
// Virtual module provided by modules/cms-reserved-routes, populated at build time.
// @ts-expect-error - resolved by Nitro at build time
import { reservedRoutes } from '#cms-reserved-routes'

/**
 * Refuse a page address one of the storefront's own routes would shadow.
 *
 * Lives here, in front of both stores, because only the storefront knows its
 * routes. Odoo checks the other half - addresses its products and categories
 * already use.
 */
export function assertSlugNotReserved(slug: string) {
  const route = storefrontRouteFor(slug, reservedRoutes as string[])
  if (route) {
    throw createError({
      statusCode: 409,
      statusMessage: `"${slug}" is used by the storefront and cannot be a content page.`,
    })
  }
}
