import { defineNuxtModule } from '@nuxt/kit'
import type { NuxtPage } from 'nuxt/schema'
import { ofetch } from 'ofetch'

export default defineNuxtModule({
    meta: {
        name: 'routes-generator',
    },
    async setup(_, nuxt) {
      
        const odooBaseUrl: string = process.env?.NUXT_PUBLIC_ODOO_BASE_URL ? `${process.env.NUXT_PUBLIC_ODOO_BASE_URL}/graphql/vsf` : ''
        const CATEGORY_PAGE_SIZE = parseInt(process.env?.NUXT_PUBLIC_CATEGORY_PAGE_SIZE || '10000', 10)
        const PRODUCT_PAGE_SIZE = parseInt(process.env?.NUXT_PUBLIC_PRODUCT_PAGE_SIZE || '10000', 10)
        const CATEGORY_PAGE_FILE = process.env?.NUXT_PUBLIC_CATEGORY_PAGE_FILE || '~/domains/category/pages/category/[id].vue'
        const PRODUCT_PAGE_FILE = process.env?.NUXT_PUBLIC_PRODUCT_PAGE_FILE || '~/domains/product/pages/product/[slug].vue'

        if (!odooBaseUrl) {
            console.error('[routes-generator] ODOO_BASE_URL is not set')
            return
        }

          const categoriesQuery = `
           query {
             categories(pageSize: ${CATEGORY_PAGE_SIZE}) {
               categories {
                 slug
               }
             }
           }
         `;

          const productsQuery = `
           query {
             products(pageSize: ${PRODUCT_PAGE_SIZE}) {
               products {
                 slug
               }
             }
           }
         `; 



         const fetchCategorySlugs = async (): Promise<string[]> => {
           try {
             const res = await ofetch(odooBaseUrl, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ query: categoriesQuery }),
             });
             return (
               res?.data?.categories?.categories
                 ?.map((c: any) => c.slug)
                 .filter(
                   (s: string) => !!s && s !== 'false' && s.startsWith('/')
                 ) || []
             );
           } catch (e) {
             console.error(
               '[routes-generator] Error fetching category slugs:',
               e
             );
             return [];
           }
         };

        const fetchProductSlugs = async (): Promise<string[]> => {
          try {
            const res = await ofetch(odooBaseUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query: productsQuery }),
            });
            return (
              res?.data?.products?.products
                ?.map((p: any) => p.slug)
                .filter(
                  (s: string) => !!s && s !== 'false' && s.startsWith('/')
                ) || []
            );
          } catch (e) {
            console.error(
              '[routes-generator] Error fetching product slugs:',
              e
            );
            return [];
          }
        };

        const [categorySlugs, productSlugs] = await Promise.all([
          fetchCategorySlugs(),
          fetchProductSlugs(),
        ]);



        console.info(
          `[routes-generator] ✅ ${categorySlugs.length} categories and ${productSlugs.length} products loaded`
        ); 

        nuxt.hook('pages:extend', (pages: NuxtPage[]) => {
            categorySlugs.forEach(slug => {
                pages.push({
                    name: `category-${slug.replace('/', '')}`,
                    path: slug,
                    file: CATEGORY_PAGE_FILE,
                })
            })

            productSlugs.forEach(slug => {
                pages.push({
                    name: `product-${slug.replace('/', '')}`,
                    path: slug,
                    file: PRODUCT_PAGE_FILE,
                })
            })

        })
    },
})