import type { H3Event } from 'h3'

export interface OdooWebsite {
  id: number
  name: string
}

/**
 * The Odoo website this request belongs to, as Odoo resolves it from
 * request-host - the same header every storefront call to Odoo sends.
 *
 * Cached per host: it changes only when a website's Domain does. A failed
 * lookup is not cached, so an Odoo hiccup does not pin it for the TTL. Null
 * when Odoo cannot say (unreachable, or an addon without the `website`
 * query); callers keep their single-website behaviour then.
 */
export const odooWebsite = cachedFunction(async (event: H3Event): Promise<OdooWebsite | null> => {
  const config = useRuntimeConfig(event)
  const response = await $fetch<{ data?: { website?: OdooWebsite | null } }>(
    new URL('/graphql/vsf', config.public.odooBaseUrl).toString(),
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'request-host': config.public.middlewareUrl || getRequestHost(event),
      },
      body: { query: 'query { website { id name } }' },
    },
  ).catch(() => null)

  const website = response?.data?.website
  return website?.id ? { id: Number(website.id), name: website.name } : null
}, {
  name: 'odoo-website',
  validate: entry => !!entry.value,
  maxAge: Number(process.env.NUXT_SWR_CACHE_TIME || 3600),
  getKey: (event: H3Event) => getRequestHost(event).replace(/\W/g, '') || 'default',
})
