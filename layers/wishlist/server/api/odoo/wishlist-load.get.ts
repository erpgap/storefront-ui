// Mirrors the cart pattern (see cart-redis/cart-load): the wishlist is served
// PURELY from the Redis 'wishlist' mount, so loading it (on any page / refresh)
// never queries Odoo. It is populated and kept fresh exclusively by the
// add/remove mutations via the manage-wishlist plugin — exactly like the cart.
// An empty Redis entry simply means an empty wishlist (no Odoo round-trip).
export default defineEventHandler(async (event: any) => {
  const session = await useStorefrontSession(event)
  const keyName = `cache:wishlist:${session?.id}`

  const data = await useStorage('wishlist').getItem(keyName)

  return data || {}
})
