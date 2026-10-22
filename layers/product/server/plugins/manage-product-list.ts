import { QueryName } from '~~/server/queries/'

/**
 * Adds each listed product's stock, from Redis, to a product list response.
 *
 * Stock is per website (Odoo writes {"<website id>": qty}), and the website
 * is the one this request belongs to. All products are read at once.
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('beforeResponse', async (event, { body }) => {
    if (event.method !== 'POST' || !event.path.startsWith('/api/odoo/query')) return

    const requestBody = await readBody(event)
    if (requestBody?.[0]?.queryName !== QueryName.GetProductTemplateListQuery) return

    const products = ((body as any)?.products?.products ?? []) as any[]
    if (!products.length) return

    const [website, stocks] = await Promise.all([
      odooWebsite(event),
      Promise.all(products.map(product => product.firstVariant?.id
        ? useStorage('stock').getItem(`stock:product-${product.firstVariant.id}`)
        : null)),
    ])

    products.forEach((product, index) => {
      if (product.firstVariant) {
        product.firstVariant.stock = stockForWebsite(stocks[index], website?.id)
      }
    })
  })
})
