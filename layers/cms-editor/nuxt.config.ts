// The EDITOR half of the CMS, kept in its own layer so its bundle — palette,
// inspector, field widgets, media picker, drag-and-drop — never ships to a
// shopper. Only /cms/** pulls any of it in.
//
// It is also where the sign-in lives: /cms/login and the cms-auth middleware,
// which shows the editor only to an Odoo user in the `CMS Editor` group. That
// is the screen, not the security boundary: Odoo checks the user's rights on
// every read and write the editor makes.
export default defineNuxtConfig({
  routeRules: {
    // The editor is a private editing surface: no SWR (it would show stale
    // drafts and look broken), no prerender, no crawlers.
    '/cms': { swr: false, prerender: false, robots: false },
    '/cms/**': { swr: false, prerender: false, robots: false },
  },
})
