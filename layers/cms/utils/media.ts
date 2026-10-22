/**
 * The <NuxtImg> provider for an image a merchant chose in the CMS.
 *
 * Media library images live in Odoo and arrive as /web/image paths, which only
 * the Odoo provider can serve. Anything else is a storefront asset and keeps
 * the default provider.
 *
 * `odooProvider` is the storefront's own Nuxt Image provider, registered in its
 * nuxt.config for every Odoo image, not just CMS ones.
 */
export function imageProvider(src: string | null | undefined): string | undefined {
  return src?.startsWith('/web/') ? 'odooProvider' : undefined
}
