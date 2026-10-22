import { VIEWPORT_DEVICE_HEADER, viewportDevice } from '../utils/viewportDevice'

/**
 * Puts the visitor's device class on the request, as `x-viewport-device`.
 *
 * Pages cached by an SWR route rule are rendered with a copy of the request
 * that keeps only the headers named in the rule's `varies` - no user-agent,
 * no cookie. nuxt-viewport, which decides between the mobile and desktop
 * header and filter sidebar on the server, then fell back to desktop for
 * everyone: phones got the desktop layout and swapped to the mobile one on
 * hydration, shifting the whole page (CLS ~0.5) and delaying its largest
 * paint by seconds.
 *
 * Varying the cache on the full user-agent would store one copy per browser
 * version. This header has three values, so each page is cached at most three
 * times, and the render can tell which layout to produce
 * (app/plugins/0.viewport-device.server.ts). modules/page-cache-rules adds
 * it to the rules' `varies`.
 *
 * Any value the client sent is overwritten: it is derived here, never trusted.
 */
export default defineEventHandler(async (event) => {
  const path = event.path
  if (path.startsWith('/_nuxt/') || path.startsWith('/api/') || path.startsWith('/__')) return

  event.node.req.headers[VIEWPORT_DEVICE_HEADER] = await viewportDevice(event.node.req.headers)
})
