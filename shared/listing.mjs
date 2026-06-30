// Single source of truth for the storefront listing page size — the number of
// products shown per category/listing page.
//
// This value varies per customer/project. Change it HERE and everything stays in
// sync: the listing component (ProductListing.vue), the URL/query helpers
// (useUiHelpers, useProductTemplateList) and the cache-warming script
// (scripts/warm-cache.mjs), which uses it to compute how many ?page=N URLs each
// category has. Plain .mjs so both the Nuxt app and the standalone node script
// can import the same constant.
//
// Note: the Algolia search page intentionally uses its own page size and is not
// driven by this value.
export const LISTING_PAGE_SIZE = 18
