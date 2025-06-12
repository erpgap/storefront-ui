import { defineNuxtModule } from '@nuxt/kit'
import type { NuxtPage } from 'nuxt/schema'
import { ofetch } from 'ofetch'

export default defineNuxtModule({
    meta: {
        name: 'routes-generator',
    },
    async setup(_, nuxt) {
      
        const odooBaseUrl: string = process.env?.NUXT_PUBLIC_ODOO_BASE_URL ? `${process.env.NUXT_PUBLIC_ODOO_BASE_URL}/graphql/vsf` : ''

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
         `;

          const productsQuery = `
           query {
             products(pageSize: 10000) {
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
                    name: slug.replace('/', ''),
                    path: slug,
                    file: '~/domains/category/custom-pages/category-page.vue',
                })
            })

            productSlugs.forEach(slug => {
                pages.push({
                    name: slug.replace('/', ''),
                    path: slug,
                    file: '~/domains/product/custom-pages/product-page.vue',
                })
            })

        })
    },
})