import type { H3Event } from 'h3'
import { withLineStock } from '../../utils/cartStock'

export default defineEventHandler(async (event: H3Event) => {
  const session = await useStorefrontSession(event)
  const keyName = `cache:cart:${session?.id}`
  // Cart is persisted under the 'cart' storage mount (see cartHelpers.updateCart),
  // so it must be read from the same mount — not the default root storage.
  const data = await useStorage('cart').getItem<any>(keyName)

  await withLineStock(event, data?.cart)

  return data || {}
})
