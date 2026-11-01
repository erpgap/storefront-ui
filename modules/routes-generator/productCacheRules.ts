/**
 * The route-rule paths that cache the product pages.
 *
 * Every rule is part of the runtime config Nitro copies and re-reads from the
 * environment on each request, so one rule per product cost every request
 * (static files included) a few milliseconds per hundred products. The addon
 * gives every product the same prefix (graphql_alokai, product.template's
 * _compute_website_slug), so one rule for the prefix caches them all - and
 * products added after the build too, which their own rule never did.
 *
 * Checked on each build rather than assumed: should a product's URL ever
 * lose the prefix, the rules go back to one per product, so no page is left
 * uncached, and `mixed` says so.
 */
export const PRODUCT_PREFIX = '/product/'

export function productCacheRules(slugs: string[]): { paths: string[], mixed: boolean } {
  if (slugs.every(slug => slug.startsWith(PRODUCT_PREFIX))) {
    return { paths: [`${PRODUCT_PREFIX}**`], mixed: false }
  }
  return { paths: slugs, mixed: true }
}
