import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'

export default defineSitemapEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const odooUrl = config.public.odooBaseUrl
  
  if (!odooUrl) {
    console.error('[Sitemap Products] Env var missing')
    return []
  }

  const pageSize = 1000 
  let allProducts: any[] = []
  let currentPage = 1
  let hasMore = true

  const query = `
    query GetProducts($pageSize: Int, $currentPage: Int) {
      products(pageSize: $pageSize, currentPage: $currentPage) {
        totalCount
        products {
          id
          slug
          image
          imageFilename
        }
      }
    }
  `

  console.log('[Sitemap Products] Starting fetch...')

  try {
    while (hasMore) {
      const response = await $fetch(`${odooUrl}graphql/vsf`, {
        method: 'POST',
        body: { 
          query,
          variables: { pageSize, currentPage }
        }
      })

      const data = response?.data?.products
      const products = data?.products || []
      const totalCount = data?.totalCount || 0
      
      allProducts = [...allProducts, ...products]
      console.log(`[Sitemap Products] Page ${currentPage}: Fetched ${products.length} (Total: ${allProducts.length}/${totalCount})`)

      const totalPages = Math.ceil(totalCount / pageSize)
      if (currentPage >= totalPages || products.length === 0) {
        hasMore = false
      } else {
        currentPage++
      }
    }
  } catch (e) {
    console.error('[Sitemap Products] Failed to fetch products:', e)
    return [] 
  }

  return allProducts.map((product) => {
    return {
      loc: `${product.slug}-${product.id}`,
      _sitemap: 'products',
      images: product.image ? [{
        loc: product.image,
        title: product.imageFilename || ''
      }] : []
    } satisfies SitemapUrlInput
  })
})