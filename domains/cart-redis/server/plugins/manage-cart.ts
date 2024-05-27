import { MutationName } from "~/server/mutations";

/**
 * This plugin is responsible for managing the cart cache.
 * It listens to the POST requests and updates the cart cache accordingly.
 * @cache store key example -> cart:255, the 255 is the odoo ID of the order
 */
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook("afterResponse", async (event, { body }) => {
    if (event.method == "POST") {
      const requestBody = await readBody(event);
      await cartAddItem(requestBody, body);
      await cartRemoveItem(requestBody, body);
      await cartUpdateItem(requestBody, body);
    }
  });
});
async function cartAddItem(requestBody: any, body: any) {
  if (requestBody[0]?.mutationName === MutationName.CartAddItem) {
    const keyName = `cache:cart:${body?.cartAddItem?.order?.id}`;
    await useStorage().setItem(keyName, body?.cartAddItem?.order);
  }
}

async function cartRemoveItem(requestBody: any, body: any) {
  if (requestBody[0]?.mutationName === MutationName.CartRemoveItem) {
    const keyName = `cache:cart:${body?.cartRemoveItem?.order?.id}`;
    await useStorage().setItem(keyName, body?.cartRemoveItem?.order);
  }
}

async function cartUpdateItem(requestBody: any, body: any) {
  if (requestBody[0]?.mutationName === MutationName.CartUpdateQuantity) {
    const keyName = `cache:cart:${body?.cartUpdateItem?.order?.id}`;
    await useStorage().setItem(keyName, body?.cartUpdateItem?.order);
  }
}
