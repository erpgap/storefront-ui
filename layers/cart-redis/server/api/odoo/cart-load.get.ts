import type { Endpoints } from '@erpgap/odoo-sdk-api-client'
import type { CustomProductWithStockFromRedis } from '~/graphql'

export default defineEventHandler(async (event: any) => {
  const websiteId = 1 // Example website ID, adjust when defined
  
  const cartId = getCookie(event, 'cart-id')
  const keyName = `cache:cart:${cartId}`
    
  const data: any = await useStorage('cart').getItem(keyName)

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
