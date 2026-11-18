import type { AttributeValue, Cart, OrderLine } from '~~/graphql'

export const reduceCart = (cartData: Cart) => ({
  frequentlyBoughtTogether: cartData?.frequentlyBoughtTogether ?? null,
  order: {
    id: cartData?.order?.id,
    amountTotal: cartData?.order?.amountTotal,
    formattedAmountTotal: cartData?.order?.formattedAmountTotal,
    formattedAmountTax: cartData?.order?.formattedAmountTax,
    formattedAmountSubtotal: cartData?.order?.formattedAmountSubtotal,
    formattedAmountDiscounts: cartData?.order?.formattedAmountDiscounts,
    formattedAmountGiftCards: cartData?.order?.formattedAmountGiftCards,
    shippingMethod: {
      id: cartData?.order?.shippingMethod?.id,
      name: cartData?.order?.shippingMethod?.name,
      price: cartData?.order?.shippingMethod?.price,
      formattedPrice: cartData?.order?.shippingMethod?.formattedPrice,
    },
    coupons: cartData?.order?.coupons,
    giftCards: cartData?.order?.giftCards,
    websiteOrderLine: cartData?.order?.websiteOrderLine?.map((line: OrderLine) => ({
      id: line?.id,
      name: line?.product?.name,
      formattedCartPrice: line?.formattedCartPrice,
      formattedPriceBeforeDiscount: line?.formattedPriceBeforeDiscount,
      formattedDiscountAmount: line?.formattedDiscountAmount,
      quantity: line?.quantity,
      product: {
        id: line?.product?.id,
        imageUrl: line?.product?.imageUrl,
        qty: line?.product?.qty,
        slug: line?.product?.slug,
        variantAttributeValues: line?.product?.variantAttributeValues?.map((attr: AttributeValue) => ({
          id: attr?.id,
          name: attr?.name,
          attribute: {
            id: attr?.attribute?.id,
            name: attr?.attribute?.name,
          },
        })),
      },
    })),
    partner: {
      id: cartData?.order?.partner?.id,
      name: cartData?.order?.partner?.name,
      email: cartData?.order?.partner?.email,
      isPublic: cartData?.order?.partner?.isPublic,
    },
    partnerShipping: {
      id: cartData?.order?.partnerShipping?.id,
      isPublic: cartData?.order?.partnerShipping?.isPublic,
      city: cartData?.order?.partnerShipping?.city,
      country: { id: cartData?.order?.partnerShipping?.country?.id },
      name: cartData?.order?.partnerShipping?.name,
      state: { id: cartData?.order?.partnerShipping?.state?.id },
      street: cartData?.order?.partnerShipping?.street,
      phone: cartData?.order?.partnerShipping?.phone,
      zip: cartData?.order?.partnerShipping?.zip,
    },
    partnerInvoice: {
      id: cartData?.order?.partnerInvoice?.id,
      isPublic: cartData?.order?.partnerInvoice?.isPublic,
      city: cartData?.order?.partnerInvoice?.city,
      country: { id: cartData?.order?.partnerInvoice?.country?.id },
      name: cartData?.order?.partnerInvoice?.name,
      state: { id: cartData?.order?.partnerInvoice?.state?.id },
      street: cartData?.order?.partnerInvoice?.street,
      phone: cartData?.order?.partnerInvoice?.phone,
      zip: cartData?.order?.partnerInvoice?.zip,
    },
  },
})

export async function updateCart(event: any, updateData: any) {
  const session = await useStorefrontSession(event)

  const keyName = `cache:cart:${session?.id}`
  const currentCart = (await useStorage('cart').getItem<{ cart: Cart }>(
    keyName,
  )) || { cart: {} }

  const updatedCart = Object.assign({}, currentCart.cart, updateData)
  const reducedCart = reduceCart(updatedCart as Cart)

  // Awaited, like its callers: the response must not leave before the cart is
  // stored, or a cart load right after it reads the previous one (an empty
  // cart after the first item, which sent checkout back to the home page).
  await useStorage('cart').setItem(keyName, { cart: reducedCart })
}
