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
    }
  });
});
async function cartAddItem(event: any, body: any) {
  const requestBody = await readBody(event);

  if (requestBody[0]?.mutationName === MutationName.CartAddItem) {
    const session = await useSession(event, {
      password: "80d42cfb-1cd2-462c-8f17-e3237d9027e9",
    });

    const keyName = `cache:cart:${session?.id}`;
    useStorage().setItem(keyName, { cart: body.cartAddItem });
  }
}

async function cartRemoveItem(event: any, body: any) {
  const requestBody = await readBody(event);
  if (requestBody[0]?.mutationName === MutationName.CartRemoveItem) {
    const session = await useSession(event, {
      password: "80d42cfb-1cd2-462c-8f17-e3237d9027e9",
    });

    const keyName = `cache:cart:${session?.id}`;
    await useStorage().setItem(keyName, { cart: body.cartRemoveItem }, {});
  }
}

async function cartUpdateItem(event: any, body: any) {
  const requestBody = await readBody(event);
  if (requestBody[0]?.mutationName === MutationName.CartUpdateQuantity) {
    const session = await useSession(event, {
      password: "80d42cfb-1cd2-462c-8f17-e3237d9027e9",
    });

    const keyName = `cache:cart:${session?.id}`;
    await useStorage().setItem(keyName, { cart: body.cartUpdateItem });
  }
}
