// Establish the cart session cookie early, on the actual browser-facing request,
// so the same session id is used when the cart is written (in the mutation's
// beforeResponse hook) and when it's read back (cart-load) on reload.
// Without this the session is created inside beforeResponse and its Set-Cookie
// never reaches the browser, so the persisted cart can never be found again.
export default defineEventHandler(async (event) => {
  if (event.path?.startsWith('/api/odoo/')) {
    await useSession(event, {
      password: 'b013b03ac2231e0b448e9a22ba488dcf',
    })
  }
})
