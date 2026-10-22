import { MutationName } from '~~/server/mutations'

// Keeps the Redis-cached wishlist in sync (same approach as manage-cart): every
// add/remove mutation already returns the full updated wishlist, so we persist
// it here under the 'wishlist' mount. Reads then come from Redis (wishlist-load)
// — so a page refresh never hits Odoo.
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('beforeResponse', async (event, { body }) => {
    if (event.method !== 'POST') return

    const requestBody = await readBody(event)
    const mutationName = requestBody?.[0]?.mutationName
    if (
      mutationName !== MutationName.WishlistAddItem
      && mutationName !== MutationName.WishlistRemoveItem
    ) {
      return
    }

    const session = await useStorefrontSession(event)
    const keyName = `cache:wishlist:${session?.id}`

    const wishlist = body?.wishlistAddItem ?? body?.wishlistRemoveItem
    if (wishlist) {
      await useStorage('wishlist').setItem(keyName, { wishlist })
    }
  })
})
