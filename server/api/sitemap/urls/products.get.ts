import { defineSitemapEventHandler } from '#imports'
import type { SitemapUrlInput } from '#sitemap/types'
import type { Product } from '~/graphql'

export default defineSitemapEventHandler(async (event: any) => {
  const query = `
query GetProducts {
  products(pageSize: 1000) {
    products {
      slug
      image
      imageFilename
    }
  }
}
`

  const odooBaseUrl = `${process.env?.NUXT_PUBLIC_ODOO_BASE_URL}graphql/vsf`

  const data = await $fetch(odooBaseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  return data?.data?.products?.products?.map((product: Product) => {
    const url: SitemapUrlInput = {
      loc: product.slug,
      _sitemap: 'products',
    }

    if (product.image) {
      url.images = [{
        loc: product.image,
        caption: product.imageFilename || '',
        title: product.imageFilename || '',
      }]
    }

    return url
  }) satisfies SitemapUrlInput[] || []
})
