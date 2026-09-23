// The EDITOR half of the CMS, kept in its own layer so its bundle — palette,
// inspector, field widgets, media picker, drag-and-drop — never ships to a
// shopper. Only /studio/** pulls any of it in.
//
// In the real implementation this layer is also where the `CMS Editor` group
// check and /studio/login live (§6.4). The PoC has NO auth: do not expose it
// on a public host.
export default defineNuxtConfig({})
