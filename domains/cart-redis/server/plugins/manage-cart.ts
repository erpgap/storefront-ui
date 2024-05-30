import { AddressType, type Cart } from "~/graphql";
import { MutationName } from "~/server/mutations";

/**
 * This plugin is responsible for managing the cart cache.
 * It listens to the POST requests and updates the cart cache accordingly.
 * @cache store key example -> cart:255, the 255 is the odoo ID of the order
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("beforeResponse", async (event, { body }) => {
    if (event.method == "POST") {
      await cartAddItem(event, body);
      await cartRemoveItem(event, body);
      await cartUpdateItem(event, body);
      await updateAddress(event, body);
      await addAddress(event, body);
      await createUpdatePartner(event, body);
    }
  });
});
async function cartAddItem(event: any, body: any) {
  const requestBody = await readBody(event);

  if (requestBody[0]?.mutationName === MutationName.CartAddItem) {
    const session = await useSession(event, {
      password: "b013b03ac2231e0b448e9a22ba488dcf",
    });

    const keyName = `cache:cart:${session?.id}`;
    const currentCart = (await useStorage().getItem<{ cart: Cart }>(
      keyName
    )) || { cart: {} };

    const cart = Object.assign({}, currentCart.cart, body.cartAddItem);
    useStorage().setItem(keyName, { cart });
  }
}

async function cartRemoveItem(event: any, body: any) {
  const requestBody = await readBody(event);
  if (requestBody[0]?.mutationName === MutationName.CartRemoveItem) {
    const session = await useSession(event, {
      password: "b013b03ac2231e0b448e9a22ba488dcf",
    });

    const keyName = `cache:cart:${session?.id}`;
    const currentCart = (await useStorage().getItem<{ cart: Cart }>(
      keyName
    )) || { cart: {} };

    const cart = Object.assign({}, currentCart.cart, body.cartRemoveItem);
    await useStorage().setItem(keyName, { cart });
  }
}

async function cartUpdateItem(event: any, body: any) {
  const requestBody = await readBody(event);
  if (requestBody[0]?.mutationName === MutationName.CartUpdateQuantity) {
    const session = await useSession(event, {
      password: "b013b03ac2231e0b448e9a22ba488dcf",
    });

    const keyName = `cache:cart:${session?.id}`;
    const currentCart = (await useStorage().getItem<{ cart: Cart }>(
      keyName
    )) || { cart: {} };

    const cart = Object.assign({}, currentCart.cart, body.cartUpdateItem);
    await useStorage().setItem(keyName, { cart });
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
    await useStorage().setItem(keyName, currentCart);
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
    console.log(body);

    if (body.updateAddress?.addressType === AddressType.DeliveryAddress) {
      currentCart.cart.order.partnerShipping = body.updateAddress;
    } else {
      currentCart.cart.order.partnerInvoice = body.updateAddress;
    }

    await useStorage().setItem(keyName, currentCart);
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
    await useStorage().setItem(keyName, currentCart);
  }
}
