// Establish the cart session cookie early, on the actual browser-facing request,
// so the same session id is used when the cart is written (in the mutation's
// beforeResponse hook) and when it's read back (cart-load) on reload.
// Without this the session is created inside beforeResponse and its Set-Cookie
// never reaches the browser, so the persisted cart can never be found again.
//
// Pages too, not only API calls: a first visit's page came without a session,
// and once hydrated it fired several API calls at once (cart, wishlist...),
// each of which made a session of its own. The browser kept whichever cookie
// came back last - often the wishlist's, after the cart had gone into the
// cart-load's session - so the cart was gone by checkout, which went home.
// Set on this request's response only: the page cache stores the render's own
// headers, not these, so no visitor is handed another's session.
export default defineEventHandler(async (event) => {
  const path = event.path || ''
  const pathname = path.split('?')[0] ?? ''
  const isPage = event.method === 'GET'
    && !pathname.startsWith('/_')
    && !pathname.startsWith('/api/')
    && !/\.[a-z0-9]+$/i.test(pathname)
  if (path.startsWith('/api/odoo/') || isPage) {
    await useStorefrontSession(event)
  }
})
