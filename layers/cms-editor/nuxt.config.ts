// The EDITOR half of the CMS, kept in its own layer so its bundle — palette,
// inspector, field widgets, media picker, drag-and-drop — never ships to a
// shopper. Only /cms/** pulls any of it in.
//
// In the real implementation this layer is also where the `CMS Editor` group
// check and /cms/login live (§6.4). The PoC has NO auth: do not expose it
// on a public host.
export default defineNuxtConfig({
  routeRules: {
    // The editor is a private editing surface: no SWR (it would show stale
    // drafts and look broken), no prerender, no crawlers.
    '/cms': { swr: false, prerender: false, robots: false },
    '/cms/**': { swr: false, prerender: false, robots: false },
  },
})
