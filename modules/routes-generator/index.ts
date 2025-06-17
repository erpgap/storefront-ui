import { defineNuxtModule, extendRouteRules } from '@nuxt/kit'
import type { NuxtPage } from 'nuxt/schema'
import { ofetch } from 'ofetch'

export default defineNuxtModule({
  meta: {
    name: 'routes-generator',
  },
  async setup(_, nuxt) {
    const odooBaseUrl: string = process.env?.NUXT_PUBLIC_ODOO_BASE_URL ? `${process.env.NUXT_PUBLIC_ODOO_BASE_URL}/graphql/vsf` : ''
    const swrValue = Number(process.env.NUXT_SWR_CACHE_TIME || 300)

    if (!odooBaseUrl) {
      console.error('[routes-generator] ODOO_BASE_URL is not set')
      return
    }

    const categoriesQuery = `
           query {
             categories(pageSize: 10000) {
               categories {
                 slug
               }
             }
           }
         `

    const productsQuery = `
           query {
             products(pageSize: 10000) {
               products {
                 slug
               }
             }
           }
         `

    const websitePagesQuery = `
      query {
        websitePages(pageSize: 10000) {
          websitePages {
            websiteUrl
          }
        }
      }
    `

    const fetchCategorySlugs = async (): Promise<string[]> => {
      try {
        const res = await ofetch(odooBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: categoriesQuery }),
        })
        return (
          res?.data?.categories?.categories
            ?.map((c: any) => c.slug)
            .filter(
              (s: string) => !!s && s !== 'false' && s.startsWith('/'),
            ) || []
        )
      }
      catch (e) {
        console.error(
          '[routes-generator] Error fetching category slugs:',
          e,
        )
        return []
      }
    }

    const fetchProductSlugs = async (): Promise<string[]> => {
      try {
        const res = await ofetch(odooBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: productsQuery }),
        })
        return (
          res?.data?.products?.products
            ?.map((p: any) => p.slug)
            .filter(
              (s: string) => !!s && s !== 'false' && s.startsWith('/'),
            ) || []
        )
      }
      catch (e) {
        console.error(
          '[routes-generator] Error fetching product slugs:',
          e,
        )
        return []
      }
    }

    const fetchWebpageSlugs = async (): Promise<string[]> => {
      try {
        const res = await ofetch(odooBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: websitePagesQuery }),
        })
        return res?.data?.websitePages?.websitePages
          ?.map((p: any) => p.websiteUrl)
          .filter((s: string) => !!s) || []
      }
      catch (e) {
        console.error('[routes-generator] Error fetching website pages:', e)
        return []
      }
    }

    const [categorySlugs, productSlugs, websitePagesUrls] = await Promise.all([
      fetchCategorySlugs(),
      fetchProductSlugs(),
      fetchWebpageSlugs(),
    ])

    console.info(
      `[routes-generator] ✅ ${categorySlugs.length} categories and ${productSlugs.length} products and ${websitePagesUrls.length} website pages loaded`,
    )

    categorySlugs.forEach((slug) => {
      extendRouteRules(slug, { swr: swrValue })
    })

    productSlugs.forEach((slug) => {
      extendRouteRules(slug, { swr: swrValue })
    })

    websitePagesUrls.forEach((url) => {
      const path = url.startsWith('/') ? url : `/${url}`
      extendRouteRules(path, { swr: swrValue })
    })

    nuxt.hook('pages:extend', (pages: NuxtPage[]) => {
      categorySlugs.forEach((slug) => {
        pages.push({
          name: slug.replace(/^\//, '').replace(/\//g, '-'),
          path: slug,
          file: '~/layers/category/custom-pages/category-page.vue',
        })
      })

      productSlugs.forEach((slug) => {
        pages.push({
          name: slug.replace(/^\//, '').replace(/\//g, '-'),
          path: slug,
          file: '~/layers/product/custom-pages/product-page.vue',
        })
      })

      websitePagesUrls.forEach((url) => {
        pages.push({
          name: url.replace(/^\//, '').replace(/\//g, '-'),
          path: url,
        })
      })
    })
  },
})
