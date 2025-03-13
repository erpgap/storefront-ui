import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'
import { Category } from '~/graphql'

export default defineSitemapEventHandler(async (event: any) => {
  const query = `
    query {
      categories(pageSize: 1000) {
        categories {
          slug
        }
      }
    }
  `
  const odooBaseUrl = `${process.env?.NUXT_PUBLIC_ODOO_BASE_URL}graphql/vsf`

  const response = await $fetch(odooBaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  })

  const categories: Category[] = response?.data?.categories?.categories || []

  const sitemapUrls = categories
    .filter((category: Category) => category.slug && category.slug !== 'false')
    .map((category: any) => ({
      loc: category.slug,
      _sitemap: 'categories'
    } satisfies SitemapUrlInput))

  return sitemapUrls
})
