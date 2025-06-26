import { QueryName } from '~/server/queries/index'

/**
 * This plugin is responsible for managing the product response.
 * It listens to the POST requests and updates the product appending the STOCK from redis.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('beforeResponse', async (event, { body }) => {
    const requestBody = await readBody(event)
    

    if (
      event.method == 'POST'
      && requestBody[0]?.queryName === QueryName.GetProductTemplateQuery
    ) {
      const id = (body as any).product.firstVariant.id
      const websiteId = 3

      const stock = await useStorage('stock').getItem<Record<number, any>>(`stock:product-${id}`);

      (body as any).product.stock = stock?.[websiteId] || 0
    }

    // if (event.method == 'POST' && requestBody[0]?.queryName === QueryName.GetProductTemplateAlternativeQuery) {
    //   const id = (body as any).product.id
    //   const websiteId = 3

    //   for (const product of (body as any)?.product?.alternativeProducts || []) {
    //     const stock = await useStorage('stock').getItem<string>(`stock:product-${product.firstVariant.id}`)
    //     try {
    //       product.stock = 0
    //       if (stock) {
    //         product.stock = stock?.[websiteId] || 0
    //       }
    //     }
    //     catch (e) {
    //       console.log(e)
    //       console.log(stock)
    //     }
    //   }
    // }
  })
})
