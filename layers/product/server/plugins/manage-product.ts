import { QueryName } from '~/server/queries/'

/**
 * This plugin is responsible for managing the product response.
 * It listens to the POST requests and updates the product appending the STOCK from redis.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('beforeResponse', async (event, { body }) => {
    const websiteId = 3 // Example website ID, adjust when defined
    const requestBody = await readBody(event)

    if (event.method == 'POST' && requestBody[0]?.queryName === QueryName.GetProductVariantQuery) {
      const id = (body as any).productVariant?.product?.id

      const stock = await useStorage('stock').getItem(`stock:product-${id}`);

      (body as any).productVariant.product.stock = stock?.[websiteId] || 0
    }
  })
})
