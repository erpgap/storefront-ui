import { AddressType, type Cart, type OrderLineWithStockFromRedis, type WishlistData } from '~/graphql'
import { MutationName } from '~/server/mutations'
import { QueryName } from '~/server/queries'

const updateCartWithRedisStock = async (cart: Cart) => {
  const websiteId = 3

  for (const orderLine of cart?.order?.websiteOrderLine || []) {
    const stock = await useStorage('stock').getItem<string>(`stock:product-${orderLine?.product?.id}`)
    try {
      (orderLine as OrderLineWithStockFromRedis).product.stock = Number(stock?.[websiteId] || 0)
    }
    catch (error: any) {
      (orderLine as OrderLineWithStockFromRedis).product.stock = 0
    }
  }
  return cart
}

/**
 * This plugin is responsible for managing the cart cache.
 * It listens to the POST requests and updates the cart cache accordingly.
 * @cache store key example -> cart:255, the 255 is the odoo ID of the order
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('beforeResponse', async (event, { body }) => {
    if (event.method == 'POST') {
      await Promise.all([
        cartAddItem(event, body),
        cartRemoveItem(event, body),
        cartUpdateItem(event, body),
        cartClear(event, body),
        updateAddress(event, body),
        addAddress(event, body),
        createUpdatePartner(event, body),
        applyCoupon(event, body),
        applyGiftCard(event, body),
        login(event, body),

        // There is a problem in this methods below, if they still needed must fix.
        // Since the checkout will be odoo, we dont need them in first release.
        // clearCartAfterCreditCardPaymentConfirmation(event, body),
        // clearCartAfterGiftCardPaymentConfirmation(event, body),
      ])
    }
  })
})
async function cartAddItem(event: any, body: any) {
  const requestBody = await readBody(event)

  if (requestBody[0]?.mutationName === MutationName.CartAddItem) {
    const session = await useSession(event, {
      password: 'b013b03ac2231e0b448e9a22ba488dcf',
    })

    const keyName = `cache:cart:${session?.id}`
    const currentCart = (await useStorage().getItem<{ cart: Cart }>(keyName)) || { cart: {} }

    let cart = Object.assign({}, currentCart.cart, body.cartAddMultipleItems)

    cart = await updateCartWithRedisStock(cart)

    await useStorage().setItem(keyName, { cart })
  }
}

async function applyCoupon(event: any, body: any) {
  const requestBody = await readBody(event)

  if (requestBody[0]?.mutationName === MutationName.ApplyCouponMutation) {
    const session = await useSession(event, {
      password: 'b013b03ac2231e0b448e9a22ba488dcf',
    })

    const keyName = `cache:cart:${session?.id}`
    const currentCart = (await useStorage().getItem<{ cart: Cart }>(
      keyName,
    )) || { cart: {} }

    let cart = Object.assign({}, currentCart.cart, body.applyCoupon)
    cart = await updateCartWithRedisStock(cart)

    useStorage().setItem(keyName, { cart })
  }
}

async function applyGiftCard(event: any, body: any) {
  const requestBody = await readBody(event)

  if (requestBody[0]?.mutationName === MutationName.ApplyGiftCardMutation) {
    const session = await useSession(event, {
      password: 'b013b03ac2231e0b448e9a22ba488dcf',
    })

    const keyName = `cache:cart:${session?.id}`
    const currentCart = (await useStorage().getItem<{ cart: Cart }>(keyName)) || { cart: {} }

    let cart = Object.assign({}, currentCart.cart, body.applyGiftCard)
    cart = await updateCartWithRedisStock(cart)

    useStorage().setItem(keyName, { cart })
  }
}

async function cartRemoveItem(event: any, body: any) {
  const requestBody = await readBody(event)
  if (requestBody[0]?.mutationName === MutationName.CartRemoveItem) {
    const session = await useSession(event, {
      password: 'b013b03ac2231e0b448e9a22ba488dcf',
    })

    const keyName = `cache:cart:${session?.id}`
    const currentCart = (await useStorage().getItem<{ cart: Cart }>(
      keyName,
    )) || { cart: {} }

    let cart = Object.assign({}, currentCart.cart, body.cartRemoveMultipleItems)
    cart = await updateCartWithRedisStock(cart)

    await useStorage().setItem(keyName, { cart })
  }
}

async function cartUpdateItem(event: any, body: any) {
  const requestBody = await readBody(event)

  if (requestBody[0]?.mutationName === MutationName.CartUpdateQuantity) {
    const session = await useSession(event, {
      password: 'b013b03ac2231e0b448e9a22ba488dcf',
    })

    const keyName = `cache:cart:${session?.id}`
    const currentCart = (await useStorage().getItem<{ cart: Cart }>(keyName)) || { cart: {} }
    let cart = Object.assign({}, currentCart.cart, body.cartUpdateMultipleItems)

    cart = await updateCartWithRedisStock(cart)

    await useStorage().setItem(keyName, { cart })
  }
}

async function addAddress(event: any, body: any) {
  const requestBody = await readBody(event)
  if (requestBody[0]?.mutationName === MutationName.AddAddress) {
    const session = await useSession(event, {
      password: 'b013b03ac2231e0b448e9a22ba488dcf',
    })

    const keyName = `cache:cart:${session?.id}`
    const currentCart
      = (await useStorage().getItem<{ cart: Cart }>(keyName)) || ({} as any)
    if (requestBody[1].type === 'Shipping') {
      currentCart.cart.order.partnerShipping = body.addAddress
    }
    else {
      currentCart.cart.order.partnerInvoice = body.addAddress
    }
    await useStorage().setItem(keyName, currentCart)
  }
}

async function updateAddress(event: any, body: any) {
  const requestBody = await readBody(event)
  if (requestBody[0]?.mutationName === MutationName.UpdateAddress) {
    const session = await useSession(event, {
      password: 'b013b03ac2231e0b448e9a22ba488dcf',
    })

    const keyName = `cache:cart:${session?.id}`
    const currentCart
      = (await useStorage().getItem<{ cart: Cart }>(keyName)) || ({} as any)

    if (body.updateAddress?.addressType === AddressType.DeliveryAddress) {
      currentCart.cart.order.partnerShipping = body.updateAddress
    }
    else {
      currentCart.cart.order.partnerInvoice = body.updateAddress
    }

    await useStorage().setItem(keyName, currentCart)
  }
}

async function createUpdatePartner(event: any, body: any) {
  const requestBody = await readBody(event)
  if (requestBody[0]?.mutationName === MutationName.CreateUpdatePartner) {
    const session = await useSession(event, {
      password: 'b013b03ac2231e0b448e9a22ba488dcf',
    })

    const keyName = `cache:cart:${session?.id}`
    const currentCart
      = (await useStorage().getItem<{ cart: Cart }>(keyName)) || ({} as any)
    currentCart.cart.order.partner = body.createUpdatePartner
    await useStorage().setItem(keyName, currentCart)
  }
}

async function clearCartAfterCreditCardPaymentConfirmation(
  event: any,
  body: any,
) {
  const requestBody = await readBody(event)

  const paymentSuccess
    = body?.paymentConfirmation.order?.lastTransaction?.state === 'Authorized'
      || body.paymentConfirmation.order?.lastTransaction?.state === 'Confirmed'

  if (requestBody[0]?.queryName === QueryName.GetPaymentConfirmation) {
    const session = await useSession(event, {
      password: 'b013b03ac2231e0b448e9a22ba488dcf',
    })

    const keyName = `cache:cart:${session?.id}`
    if (paymentSuccess) {
      await useStorage().removeItem(keyName)
    }
  }
}

async function cartClear(event: any, body: any) {
  const requestBody = await readBody(event)

  if (requestBody[0]?.mutationName === MutationName.CartClear) {
    const session = await useSession(event, { password: 'b013b03ac2231e0b448e9a22ba488dcf' })

    const keyName = `cache:cart:${session?.id}`
    await useStorage().removeItem(keyName)
  }
}

async function login(event: any, body: any) {
  const requestBody = await readBody(event)

  if (requestBody[0]?.mutationName === MutationName.LoginMutation) {
    try {
      const session = await useSession(event, {
        password: 'b013b03ac2231e0b448e9a22ba488dcf',
      })

      const keyName = `cart:${session?.id}`
      const currentCart = (await useStorage().getItem<{ cart: Cart }>(keyName)) || ({} as any)
      if (body?.login?.cart?.websiteOrderLine?.length > 0) {
        currentCart.cart.order = body.cart
        await useStorage().setItem(keyName, currentCart)
      }
      else {
        currentCart.cart.order.partner = body.cart.order.partner
        currentCart.cart.order.partnerShipping = body.cart.order.partnerShipping
        currentCart.cart.order.partnerInvoice = body.cart.order.partnerInvoice
      }

      const keyNameWishlist = `cache:wishlist:${session?.id}`
      const currentWishlist = (await useStorage().getItem<WishlistData>(
        keyNameWishlist,
      )) || { wishlistItems: {}, totalCount: 0 }

      const wishlist = Object.assign(
        {},
        currentWishlist.wishlistItems,
        body.login.wishlistItems,
      )

      await useStorage().setItem(keyNameWishlist, { wishlist })
    }
    catch (error) {
      //
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
    const session = await useSession(event, {
      password: 'b013b03ac2231e0b448e9a22ba488dcf',
    })

    const keyName = `cache:cart:${session?.id}`
    if (paymentSuccess) {
      await useStorage().removeItem(keyName)
    }
  }
}
