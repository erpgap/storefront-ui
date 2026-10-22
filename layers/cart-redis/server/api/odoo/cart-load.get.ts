import type { H3Event } from 'h3'
import type { CustomProductWithStockFromRedis } from '~~/graphql'

export default defineEventHandler(async (event: H3Event) => {
  const session = await useStorefrontSession(event)
  const keyName = `cache:cart:${session?.id}`
  // Cart is persisted under the 'cart' storage mount (see cartHelpers.updateCart),
  // so it must be read from the same mount — not the default root storage.
  const data = await useStorage('cart').getItem<any>(keyName)

  // Each line's stock for the website this request belongs to, read at once.
  const lines = (data?.cart?.order?.websiteOrderLine ?? []) as { product?: CustomProductWithStockFromRedis }[]
  if (lines.length) {
    const [website, stocks] = await Promise.all([
      odooWebsite(event),
      Promise.all(lines.map(line => line.product?.id
        ? useStorage('stock').getItem(`stock:product-${line.product.id}`)
        : null)),
    ])
    lines.forEach((line, index) => {
      if (line.product) line.product.stock = stockForWebsite(stocks[index], website?.id)
    })
  }

  return data || {}
})
