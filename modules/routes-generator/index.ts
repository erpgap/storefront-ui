import { join } from 'node:path'
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

    // CMS pages get their routes from the CMS layer's own module
    // (layers/cms/modules/cms-page-routes); this one only knows the catalogue.
    const [categorySlugs, productSlugs] = await Promise.all([
      fetchCategorySlugs(),
      fetchProductSlugs(),
    ])

    categorySlugs.forEach((slug) => {
      extendRouteRules(slug, { swr: swrValue })
    })

    productSlugs.forEach((slug) => {
      extendRouteRules(slug, { swr: swrValue })
    })

    console.info(
      `[routes-generator] ✅ ${categorySlugs.length} categories and ${productSlugs.length} products loaded`,
    )

    /**
     * Routes are given a real filesystem path rather than the `#layers` alias.
     *
     * The alias resolves fine for the bundler, but @nuxtjs/i18n reads each
     * route's component off disk to look for `defineI18nRoute`, and it does
     * that with plain `fs`, which knows nothing about Nuxt aliases. Pointing
     * at the file directly keeps both happy.
     */
    const layerPage = (relative: string) =>
      join(nuxt.options.rootDir, 'layers', relative)

    nuxt.hook('pages:extend', (pages: NuxtPage[]) => {
      categorySlugs.forEach((slug) => {
        pages.push({
          name: slug.replace(/^\//, '').replace(/\//g, '-'),
          path: slug,
          file: layerPage('category/custom-pages/category-page.vue'),
        })
      })

      productSlugs.forEach((slug) => {
        pages.push({
          name: slug.replace(/^\//, '').replace(/\//g, '-'),
          path: slug,
          file: layerPage('product/custom-pages/product-page.vue'),
        })
      })
    })
  },
})
