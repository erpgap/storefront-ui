import type { Endpoints } from '@erpgap/odoo-sdk-api-client'
import type { CustomProductWithStockFromRedis } from '~/graphql'

export default defineEventHandler(async (event: any) => {
  const websiteId = 3 // Example website ID, adjust when defined
  const session = await useSession(event, {
    password: 'b013b03ac2231e0b448e9a22ba488dcf',
  })
  const keyName = `cache:cart:${session?.id}`
  const data = await useStorage().getItem(keyName)

  for (const orderLine of data?.cart?.order?.websiteOrderLine || []) {
    const stock = await useStorage('stock').getItem<string>(
      `stock:product-${orderLine?.product?.id}`,
    )

    try {
      (orderLine.product as CustomProductWithStockFromRedis).stock = 0
      if (stock) {
        (orderLine.product as CustomProductWithStockFromRedis).stock = stock?.[websiteId] || 0
      }
    }
    catch (e) {
      console.log(e)
      console.log(stock)
    }
  }

  return data || {}
})
