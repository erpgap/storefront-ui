import { updateCart, reduceCart } from '../utils/cartHelpers.js'
import { withLineStock } from '../utils/cartStock'
import { AddressType, type Cart } from '~~/graphql'
import { MutationName } from '~~/server/mutations'
import { QueryName } from '~~/server/queries'

/**
 * This plugin is responsible for managing the cart cache.
 * It listens to the POST requests and updates the cart cache accordingly.
 * @cache store key example -> cart:255, the 255 is the odoo ID of the order
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('beforeResponse', async (event, { body }) => {
    if (event.method == 'POST') {
      await cartAddItem(event, body)
      await cartRemoveItem(event, body)
      await cartUpdateItem(event, body)
      await updateAddress(event, body)
      await addAddress(event, body)
      await createUpdatePartner(event, body)
      await applyCoupon(event, body)
      await applyGiftCard(event, body)
      await clearCartAfterCreditCardPaymentConfirmation(event, body)
      await clearCartAfterGiftCardPaymentConfirmation(event, body)
    }
  })
})
async function cartAddItem(event: any, body: any) {
  const requestBody = await readBody(event)

  if (requestBody[0]?.mutationName === MutationName.CartAddItem) {
    await withLineStock(event, body.cartAddMultipleItems)
    updateCart(event, body.cartAddMultipleItems)
  }
}

async function applyCoupon(event: any, body: any) {
  const requestBody = await readBody(event)

  if (requestBody[0]?.mutationName === MutationName.ApplyCouponMutation) {
    await withLineStock(event, body.applyCoupon)
    updateCart(event, body.applyCoupon)
  }
}

async function applyGiftCard(event: any, body: any) {
  const requestBody = await readBody(event)

  if (requestBody[0]?.mutationName === MutationName.ApplyGiftCardMutation) {
    await withLineStock(event, body.applyGiftCard)
    updateCart(event, body.applyGiftCard)
  }
}

async function cartRemoveItem(event: any, body: any) {
  const requestBody = await readBody(event)
  if (requestBody[0]?.mutationName === MutationName.CartRemoveItem) {
    await withLineStock(event, body.cartRemoveMultipleItems)
    updateCart(event, body.cartRemoveMultipleItems)
  }
}

async function cartUpdateItem(event: any, body: any) {
  const requestBody = await readBody(event)
  if (requestBody[0]?.mutationName === MutationName.CartUpdateQuantity) {
    await withLineStock(event, body.cartUpdateMultipleItems)
    updateCart(event, body.cartUpdateMultipleItems)
  }
}

async function addAddress(event: any, body: any) {
  const requestBody = await readBody(event)
  if (requestBody[0]?.mutationName === MutationName.AddAddress) {
    const session = await useStorefrontSession(event)

    const keyName = `cache:cart:${session?.id}`
    const currentCart
      = (await useStorage('cart').getItem<{ cart: Cart }>(keyName)) || { cart: {} as Cart }
    // Nothing cached to update: the next cart load reads it fresh. This used
    // to throw here, turning a mutation Odoo had applied into a 500.
    const order = currentCart.cart.order
    if (!order) return
    if (requestBody[1].type === 'Shipping') {
      order.partnerShipping = body.addAddress
    }
    else {
      order.partnerInvoice = body.addAddress
    }
    if (order.partner) order.partner.isPublic = body.addAddress?.isPublic || false

    const reducedCart = reduceCart(currentCart.cart as Cart)
    await useStorage('cart').setItem(keyName, { cart: reducedCart })
  }
}

async function updateAddress(event: any, body: any) {
  const requestBody = await readBody(event)
  if (requestBody[0]?.mutationName === MutationName.UpdateAddress) {
    const session = await useStorefrontSession(event)

    const keyName = `cache:cart:${session?.id}`
    const currentCart
      = (await useStorage('cart').getItem<{ cart: Cart }>(keyName)) || { cart: {} as Cart }

    // See addAddress: no cached cart, nothing to update.
    const order = currentCart.cart.order
    if (!order) return
    if (body.updateAddress?.addressType === AddressType.DeliveryAddress) {
      order.partnerShipping = body.updateAddress
    }
    else {
      order.partnerInvoice = body.updateAddress
    }
    if (order.partner) order.partner.isPublic = body.updateAddress?.isPublic || false

    const reducedCart = reduceCart(currentCart.cart as Cart)
    await useStorage('cart').setItem(keyName, { cart: reducedCart })
  }
}

async function createUpdatePartner(event: any, body: any) {
  const requestBody = await readBody(event)
  if (requestBody[0]?.mutationName === MutationName.CreateUpdatePartner) {
    const session = await useStorefrontSession(event)

    const keyName = `cache:cart:${session?.id}`
    const currentCart
      = (await useStorage('cart').getItem<{ cart: Cart }>(keyName)) || { cart: {} as Cart }
    // See addAddress: no cached cart, nothing to update.
    if (!currentCart.cart.order) return
    currentCart.cart.order.partner = body.createUpdatePartner

    const reducedCart = reduceCart(currentCart.cart as Cart)
    await useStorage('cart').setItem(keyName, { cart: reducedCart })
  }
}

async function clearCartAfterCreditCardPaymentConfirmation(
  event: any,
  body: any,
) {
  const requestBody = await readBody(event)

  const paymentSuccess
    = body?.paymentConfirmation?.order?.lastTransaction?.state === 'Authorized'
      || body.paymentConfirmation?.order?.lastTransaction?.state === 'Confirmed'

  if (requestBody[0]?.queryName === QueryName.GetPaymentConfirmation) {
    const session = await useStorefrontSession(event)

    const keyName = `cache:cart:${session?.id}`
    if (paymentSuccess) {
      await useStorage('cart').removeItem(keyName)
    }
  }
}

async function clearCartAfterGiftCardPaymentConfirmation(
  event: any,
  body: any,
) {
  const requestBody = await readBody(event)

  const paymentSuccess = body?.makeGiftCardPayment?.done

  if (
    requestBody[0]?.mutationName === MutationName.MakeGiftCardPaymentMutation
  ) {
    const session = await useStorefrontSession(event)

    const keyName = `cache:cart:${session?.id}`
    if (paymentSuccess) {
      await useStorage('cart').removeItem(keyName)
    }
  }
}
