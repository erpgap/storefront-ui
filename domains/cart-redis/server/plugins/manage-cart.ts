import { AddressType, type Cart } from "~/graphql";
import { MutationName } from "~/server/mutations";
import { QueryName } from "~/server/queries";
import {updateCart, reduceCart} from "../utils/cartHelpers.js"

/**
 * This plugin is responsible for managing the cart cache.
 * It listens to the POST requests and updates the cart cache accordingly.
 * @cache store key example -> cart:255, the 255 is the odoo ID of the order
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("beforeResponse", async (event, { body }) => {
    if (event.method == "POST") {
      await Promise.all([
        cartAddItem(event, body),
        cartRemoveItem(event, body),
        cartUpdateItem(event, body),
        updateAddress(event, body),
        addAddress(event, body),
        createUpdatePartner(event, body),
        applyCoupon(event, body),
        applyGiftCard(event, body),
        clearCartAfterCreditCardPaymentConfirmation(event, body),
        clearCartAfterGiftCardPaymentConfirmation(event, body),
      ]);
    }
  });
});
async function cartAddItem(event: any, body: any) {
  const requestBody = await readBody(event);

  if (requestBody[0]?.mutationName === MutationName.CartAddItem) {
    await updateCart(event,body.cartAddMultipleItems)
  }
}

async function applyCoupon(event: any, body: any) {
  const requestBody = await readBody(event);

  if (requestBody[0]?.mutationName === MutationName.ApplyCouponMutation) {
    await updateCart(event,body.applyCoupon)
  }
}

async function applyGiftCard(event: any, body: any) {
  const requestBody = await readBody(event);

  if (requestBody[0]?.mutationName === MutationName.ApplyGiftCardMutation) {
    await updateCart(event,body.applyGiftCard)
  }
}

async function cartRemoveItem(event: any, body: any) {
  const requestBody = await readBody(event);
  if (requestBody[0]?.mutationName === MutationName.CartRemoveItem) {
    await updateCart(event,body.cartRemoveMultipleItems)
  }
}

async function cartUpdateItem(event: any, body: any) {
  const requestBody = await readBody(event);
  if (requestBody[0]?.mutationName === MutationName.CartUpdateQuantity) {
    await updateCart(event,body.cartUpdateMultipleItems)
  }
}

async function addAddress(event: any, body: any) {
  const requestBody = await readBody(event);
  if (requestBody[0]?.mutationName === MutationName.AddAddress) {
    const session = await useSession(event, {
      password: "b013b03ac2231e0b448e9a22ba488dcf",
    });

    const keyName = `cache:cart:${session?.id}`;
    const currentCart =
      (await useStorage().getItem<{ cart: Cart }>(keyName)) || ({} as any);
    if (requestBody[1].type === "Shipping") {
      currentCart.cart.order.partnerShipping = body.addAddress;
    } else {
      currentCart.cart.order.partnerInvoice = body.addAddress;
    }
    
    const reducedCart = reduceCart(currentCart as Cart)
    await useStorage().setItem(keyName, reducedCart);
  }
}

async function updateAddress(event: any, body: any) {
  const requestBody = await readBody(event);
  if (requestBody[0]?.mutationName === MutationName.UpdateAddress) {
    const session = await useSession(event, {
      password: "b013b03ac2231e0b448e9a22ba488dcf",
    });

    const keyName = `cache:cart:${session?.id}`;
    const currentCart =
      (await useStorage().getItem<{ cart: Cart }>(keyName)) || ({} as any);

    if (body.updateAddress?.addressType === AddressType.DeliveryAddress) {
      currentCart.cart.order.partnerShipping = body.updateAddress;
    } else {
      currentCart.cart.order.partnerInvoice = body.updateAddress;
    }
    
    const reducedCart = reduceCart(currentCart as Cart)
    await useStorage().setItem(keyName, reducedCart);
  }
}

async function createUpdatePartner(event: any, body: any) {
  const requestBody = await readBody(event);
  if (requestBody[0]?.mutationName === MutationName.CreateUpdatePartner) {
    const session = await useSession(event, {
      password: "b013b03ac2231e0b448e9a22ba488dcf",
    });

    const keyName = `cache:cart:${session?.id}`;
    const currentCart =
      (await useStorage().getItem<{ cart: Cart }>(keyName)) || ({} as any);
    currentCart.cart.order.partner = body.createUpdatePartner;
    
    const reducedCart = reduceCart(currentCart as Cart)
    await useStorage().setItem(keyName, reducedCart);
  }
}

async function clearCartAfterCreditCardPaymentConfirmation(
  event: any,
  body: any
) {
  const requestBody = await readBody(event);

  const paymentSuccess =
    body?.paymentConfirmation.order?.lastTransaction?.state === "Authorized" ||
    body.paymentConfirmation.order?.lastTransaction?.state === "Confirmed";

  if (requestBody[0]?.queryName === QueryName.GetPaymentConfirmation) {
    const session = await useSession(event, {
      password: "b013b03ac2231e0b448e9a22ba488dcf",
    });

    const keyName = `cache:cart:${session?.id}`;
    if (paymentSuccess) {
      await useStorage().removeItem(keyName);
    }
  }
}

async function clearCartAfterGiftCardPaymentConfirmation(
  event: any,
  body: any
) {
  const requestBody = await readBody(event);

  const paymentSuccess = body?.makeGiftCardPayment?.done;

  if (
    requestBody[0]?.mutationName === MutationName.MakeGiftCardPaymentMutation
  ) {
    const session = await useSession(event, {
      password: "b013b03ac2231e0b448e9a22ba488dcf",
    });

    const keyName = `cache:cart:${session?.id}`;
    if (paymentSuccess) {
      await useStorage().removeItem(keyName);
    }
  }
}
