import type { H3Event } from 'h3'
import type { Cart, CustomProductWithStockFromRedis } from '~~/graphql'

/**
 * Puts each cart line's stock, for the request's website, on its product.
 *
 * The cart drawer and page cap each line's quantity by it. Only cart-load
 * used to add it, so a cart that came back from adding, removing or updating
 * a line had none and every cap fell back to its default until a reload.
 */
export async function withLineStock<T extends Cart | null | undefined>(event: H3Event, cart: T): Promise<T> {
  const lines = (cart?.order?.websiteOrderLine ?? []) as { product?: CustomProductWithStockFromRedis | null }[]
  if (!lines.length) return cart

  const [website, stocks] = await Promise.all([
    odooWebsite(event),
    Promise.all(lines.map(line => line.product?.id
      ? useStorage('stock').getItem(`stock:product-${line.product.id}`)
      : null)),
  ])
  lines.forEach((line, index) => {
    if (line.product) line.product.stock = stockForWebsite(stocks[index], website?.id)
  })
  return cart
}
