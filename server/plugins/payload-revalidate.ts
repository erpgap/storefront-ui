import { defineNitroPlugin } from 'nitropack/runtime'

/**
 * A page's data (/<page>/_payload.json) is fetched apart from its HTML, after
 * it. Its route-rule header (s-maxage, stale-while-revalidate) says nothing
 * to a browser, which then kept a copy by its own reckoning: the HTML came
 * fresh, the data did not, and the page redrew itself a moment later with
 * the old data (menu entries since removed, say). The URL changes per build,
 * not when Odoo's content does, so nothing else forced a new copy.
 *
 * Browsers now check back every time (max-age=0, must-revalidate): a 304 when
 * nothing changed. Shared caches keep the route rule's s-maxage. Kept rather
 * than putting the data in the HTML (payloadExtraction: false), which made
 * the HTML bigger and the first paint 120-400 ms later on mobile Lighthouse.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', (event) => {
    if (!event.path.split('?')[0]!.endsWith('/_payload.json')) return
    const shared = String(getResponseHeader(event, 'cache-control') ?? '')
      .split(',')
      .map(directive => directive.trim())
      .filter(directive => /^(?:s-maxage|stale-while-revalidate)\b/.test(directive))
    setResponseHeader(event, 'cache-control', ['max-age=0', 'must-revalidate', ...shared].join(', '))
  })
})
