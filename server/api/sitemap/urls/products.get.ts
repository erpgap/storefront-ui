import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'
import { buildOdooImageUrl } from '~/utils/odooImage'

const SITEMAP_IMAGE_SIZE = 800

export default defineSitemapEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const odooUrl = config.public.odooBaseUrl
  const odooBaseImageUrl = config.public.odooBaseImageUrl
  
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
          imageUrl
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
    const imageLoc = product.imageUrl
      ? buildOdooImageUrl(
          product.imageUrl,
          SITEMAP_IMAGE_SIZE,
          SITEMAP_IMAGE_SIZE,
          odooBaseImageUrl,
        )
      : undefined

    return {
      loc: `${product.slug}-${product.id}`,
      _sitemap: 'products',
      images: imageLoc ? [{
        loc: imageLoc,
      }] : []
    } satisfies SitemapUrlInput
  })
})
