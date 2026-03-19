import { updateCart, reduceCart } from '../utils/cartHelpers.js'
import { AddressType, type Cart } from '~/graphql'
import { MutationName } from '~/server/mutations'
import { QueryName } from '~/server/queries'

/**
 * This plugin is responsible for managing the cart cache.
 * It listens to the POST requests and updates the cart cache accordingly.
 * @cache store key example -> cart:255, the 255 is the odoo ID of the order
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('beforeResponse', async (event, { body }) => {
    if (event.method == 'POST') {
      const requestBody = await readBody(event).catch(() => null)
      if (!requestBody) return

      await cartAddItem(event, body, requestBody)
      await cartRemoveItem(event, body, requestBody)
      await cartUpdateItem(event, body, requestBody)
      await updateAddress(event, body, requestBody)
      await addAddress(event, body, requestBody)
      await createUpdatePartner(event, body, requestBody)
      await applyCoupon(event, body, requestBody)
      await applyGiftCard(event, body, requestBody)
      await clearCartAfterCreditCardPaymentConfirmation(event, body, requestBody)
      await clearCartAfterGiftCardPaymentConfirmation(event, body, requestBody)
    }
  })
})

async function cartAddItem(event: any, body: any, requestBody: any) {
  if (requestBody[0]?.mutationName === MutationName.CartAddItem) {
    updateCart(event, body.cartAddMultipleItems)
  }
}

async function applyCoupon(event: any, body: any, requestBody: any) {
  if (requestBody[0]?.mutationName === MutationName.ApplyCouponMutation) {
    updateCart(event, body.applyCoupon)
  }
}

async function applyGiftCard(event: any, body: any, requestBody: any) {
  if (requestBody[0]?.mutationName === MutationName.ApplyGiftCardMutation) {
    updateCart(event, body.applyGiftCard)
  }
}

async function cartRemoveItem(event: any, body: any, requestBody: any) {
  if (requestBody[0]?.mutationName === MutationName.CartRemoveItem) {
    updateCart(event, body.cartRemoveMultipleItems)
  }
}

async function cartUpdateItem(event: any, body: any, requestBody: any) {
  if (requestBody[0]?.mutationName === MutationName.CartUpdateQuantity) {
    updateCart(event, body.cartUpdateMultipleItems)
  }
}

async function addAddress(event: any, body: any, requestBody: any) {
  if (requestBody[0]?.mutationName === MutationName.AddAddress) {
    const cartId = getCookie(event, 'cart-id')
    const keyName = `cache:cart:${cartId}`
    console.log(`[cart-redis] addAddress: Loading cart from ${keyName}`)
    const currentCart
      = (await useStorage('cart').getItem<{ cart: Cart }>(keyName)) || ({} as any)
    
    if (!currentCart?.cart?.order) {
      console.warn(`[cart-redis] addAddress: Cart not found for ${keyName}`)
      return
    }

    if (requestBody[1].type === 'Shipping') {
      currentCart.cart.order.partnerShipping = body.addAddress
      currentCart.cart.order.partner.isPublic = body.addAddress?.isPublic || false
    }
    else {
      currentCart.cart.order.partnerInvoice = body.addAddress
      currentCart.cart.order.partner.isPublic = body.addAddress?.isPublic || false
    }

    const reducedCart = reduceCart(currentCart as Cart)
    console.log(`[cart-redis] addAddress: Updating storage at ${keyName}`)
    await useStorage('cart').setItem(keyName, reducedCart)
  }
}

async function updateAddress(event: any, body: any, requestBody: any) {
  if (requestBody[0]?.mutationName === MutationName.UpdateAddress) {
    const cartId = getCookie(event, 'cart-id')
    const keyName = `cache:cart:${cartId}`
    console.log(`[cart-redis] updateAddress: Loading cart from ${keyName}`)
    const currentCart
      = (await useStorage('cart').getItem<{ cart: Cart }>(keyName)) || ({} as any)

    if (!currentCart?.cart?.order) {
      console.warn(`[cart-redis] updateAddress: Cart not found for ${keyName}`)
      return
    }

    if (body.updateAddress?.addressType === AddressType.DeliveryAddress) {
      currentCart.cart.order.partnerShipping = body.updateAddress
      currentCart.cart.order.partner.isPublic = body.updateAddress?.isPublic || false
    }
    else {
      currentCart.cart.order.partnerInvoice = body.updateAddress
      currentCart.cart.order.partner.isPublic = body.updateAddress?.isPublic || false
    }

    const reducedCart = reduceCart(currentCart as Cart)
    console.log(`[cart-redis] updateAddress: Updating storage at ${keyName}`)
    await useStorage('cart').setItem(keyName, reducedCart)
  }
}

async function createUpdatePartner(event: any, body: any, requestBody: any) {
  if (requestBody[0]?.mutationName === MutationName.CreateUpdatePartner) {
    const cartId = getCookie(event, 'cart-id')
    const keyName = `cache:cart:${cartId}`
    console.log(`[cart-redis] createUpdatePartner: Loading cart from ${keyName}`)
    const currentCart
      = (await useStorage('cart').getItem<{ cart: Cart }>(keyName)) || ({} as any)
    
    if (!currentCart?.cart?.order) {
      console.warn(`[cart-redis] createUpdatePartner: Cart not found for ${keyName}`)
      return
    }

    currentCart.cart.order.partner = body.createUpdatePartner

    const reducedCart = reduceCart(currentCart as Cart)
    console.log(`[cart-redis] createUpdatePartner: Updating storage at ${keyName}`)
    await useStorage('cart').setItem(keyName, reducedCart)
  }
}

async function clearCartAfterCreditCardPaymentConfirmation(
  event: any,
  body: any,
  requestBody: any
) {
  const paymentSuccess
    = body?.paymentConfirmation?.order?.lastTransaction?.state === 'Authorized'
      || body.paymentConfirmation?.order?.lastTransaction?.state === 'Confirmed'

  if (requestBody[0]?.queryName === QueryName.GetPaymentConfirmation) {
    const cartId = getCookie(event, 'cart-id')
    const keyName = `cache:cart:${cartId}`
    if (paymentSuccess) {
      console.log(`[cart-redis] clearCart: Payment success. Removing ${keyName} and cookie.`)
      await useStorage('cart').removeItem(keyName)
      deleteCookie(event, 'cart-id')
    }
  }
}

async function clearCartAfterGiftCardPaymentConfirmation(
  event: any,
  body: any,
  requestBody: any
) {
  const paymentSuccess = body?.makeGiftCardPayment?.done

  if (
    requestBody[0]?.mutationName === MutationName.MakeGiftCardPaymentMutation
  ) {
    const cartId = getCookie(event, 'cart-id')
    const keyName = `cache:cart:${cartId}`
    if (paymentSuccess) {
      console.log(`[cart-redis] clearCart: Gift card payment success. Removing ${keyName} and cookie.`)
      await useStorage('cart').removeItem(keyName)
      deleteCookie(event, 'cart-id')
    }
  }
}
