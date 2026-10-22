import { QueryName } from '~~/server/queries/'

/**
 * Adds the product's stock, from Redis, to a product variant response, for
 * the website this request belongs to.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('beforeResponse', async (event, { body }) => {
    if (event.method !== 'POST' || !event.path.startsWith('/api/odoo/query')) return

    const requestBody = await readBody(event)
    if (requestBody?.[0]?.queryName !== QueryName.GetProductVariantQuery) return

    const product = (body as any)?.productVariant?.product
    if (!product?.id) return

    const [website, stock] = await Promise.all([
      odooWebsite(event),
      useStorage('stock').getItem(`stock:product-${product.id}`),
    ])
    product.stock = stockForWebsite(stock, website?.id)
  })
})
