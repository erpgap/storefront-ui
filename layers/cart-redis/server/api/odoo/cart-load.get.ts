import type { H3Event } from 'h3'
import type { Cart } from '~~/graphql'
import { Queries } from '~~/server/queries'
import { updateCart } from '../../utils/cartHelpers'
import { withLineStock } from '../../utils/cartStock'

export default defineEventHandler(async (event: H3Event) => {
  const session = await useStorefrontSession(event)
  const keyName = `cache:cart:${session?.id}`
  // Cart is persisted under the 'cart' storage mount (see cartHelpers.updateCart),
  // so it must be read from the same mount — not the default root storage.
  let data = await useStorage('cart').getItem<any>(keyName)

  // A cart stored before Odoo sent its amounts formatted has none to show,
  // and only a cart change would store it again: read it from Odoo, once.
  if (data?.cart?.order && data.cart.order.formattedAmountTotal === undefined) {
    try {
      const response = await odooGraphql<{ cart: Cart }>(event, Queries.LoadCartQuery, {}, { session: true })
      if (response.data?.cart) {
        await updateCart(event, response.data.cart)
        data = await useStorage('cart').getItem<any>(keyName)
      }
    }
    catch (error: any) {
      // The stored cart, as before, rather than no cart.
      console.error('Refreshing a stored cart failed:', error?.message ?? error)
    }
  }

  await withLineStock(event, data?.cart)

  return data || {}
})
