import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'

export default defineSitemapEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const odooUrl = config.public.odooBaseUrl

  // Log para debug em produção (verificar logs do servidor)
  if (!odooUrl) {
    console.error('[Sitemap Categories] NUXT_PUBLIC_ODOO_BASE_URL is missing!')
    return []
  }

  const query = `
    query {
      categories(pageSize: 1000) {
        categories {
          slug
        }
      }
    }
  `
  
  try {
    const response = await $fetch(`${odooUrl}graphql/vsf`, {
      method: 'POST',
      body: { query },
    })

    const categories = response?.data?.categories?.categories || []
    console.log(`[Sitemap Categories] Fetched ${categories.length} categories`)

    return categories
      .filter((c: any) => c.slug && c.slug !== 'false')
      .map((c: any) => ({
        loc: c.slug,
        _sitemap: 'categories',
      } satisfies SitemapUrlInput))

  } catch (error) {
    console.error('[Sitemap Categories] Error fetching from Odoo:', error)
    return []
  }
})