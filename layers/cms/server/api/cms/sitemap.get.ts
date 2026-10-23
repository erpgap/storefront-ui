/**
 * Published CMS pages, for the `pages` sitemap (see this layer's
 * nuxt.config).
 *
 * Read from Odoo on each (cached) sitemap render rather than from the routes
 * generated at build time, so a page published this afternoon is in the
 * sitemap without waiting for a deploy. Odoo scopes the list to the website
 * in request-host and to published pages.
 *
 * `/` is left out: the homepage is a page of the storefront's own and is
 * listed with the other static pages.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const url = new URL('/graphql/vsf', config.public.odooBaseUrl).toString()

  const response = await $fetch<{
    data?: { websitePages?: { websitePages?: { websiteUrl?: string | null, publishingDate?: string | null }[] } }
  }>(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...odooWebsiteHeaders(event) },
    body: {
      query: 'query { websitePages(pageSize: 10000) { websitePages { websiteUrl publishingDate } } }',
    },
  })

  return (response?.data?.websitePages?.websitePages ?? [])
    .filter(page => page.websiteUrl && page.websiteUrl !== '/')
    .map(page => ({
      loc: page.websiteUrl!.startsWith('/') ? page.websiteUrl! : `/${page.websiteUrl}`,
      ...(page.publishingDate ? { lastmod: page.publishingDate } : {}),
      _sitemap: 'pages',
    }))
})
