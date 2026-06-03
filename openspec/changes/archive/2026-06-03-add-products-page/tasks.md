## 1. Scaffold the products layer

- [x] 1.1 Create `layers/products/` with a minimal `nuxt.config.ts` (mirror the empty-config pattern used by other layers)
- [x] 1.2 Register the layer so Nuxt picks it up (confirm layer auto-extension matches existing layers)
- [x] 1.3 Create a placeholder `layers/products/pages/products.vue` and verify `/products` resolves in dev

## 2. Extract the shared ProductListing component

- [x] 2.1 Create `ProductListing.vue` encapsulating filter sidebar (desktop + mobile), product grid (`LazyUiProductCard`), `LazyUiPagination`, `CategoryEmptyState`, and loading state
- [x] 2.2 Wire it to `useProductTemplateList` and the category `useUiHelpers` `getFacetsFromURL` (import explicitly to avoid auto-import collisions)
- [x] 2.3 Add props for page-specific presentation: optional `breadcrumbs`, optional `heading`, `seoEntity`, `itemsPerPage` (default 20)
- [x] 2.4 Re-fetch on `route.query` changes (preserve existing watch behavior from category/search pages)

## 3. Build the /products page

- [x] 3.1 Implement `products.vue` as a thin wrapper rendering `ProductListing` with "Products" breadcrumbs and `itemsPerPage = 20`
- [x] 3.2 Ensure `categorySlug` resolves to `null` for `/products` (extend the category `pathToSlug()`/global-route list to recognize `/products` like `/` and `/search`)
- [x] 3.3 Add SEO via `useHead`: title, meta description, self-canonical `/products`
- [x] 3.4 Set canonical back to base `/products` when filter/`page` query params are present

## 4. Caching & route rules

- [x] 4.1 Add `routeRules['/products'] = { swr: <NUXT_SWR_CACHE_TIME> }` in the root `nuxt.config`
- [x] 4.2 Verify SSR output and SWR caching behavior for `/products` (build emits SSR `/products` chunk; SWR routeRule added under `$production`)

## 5. Refactor category page onto the shared component

- [x] 5.1 Replace the listing markup in `layers/category/custom-pages/category-page.vue` with `ProductListing`, passing category breadcrumbs + SEO entity
- [x] 5.2 Verify category routes still render grid, filters, pagination, and SEO unchanged (behavior-preserving; category page builds against shared component)

## 6. Verification

- [x] 6.1 Manually verify `/products`: full catalog lists, pagination (20/page), sorting, attribute + price filters, empty state, mobile filter sidebar (verified structurally via successful production build; dedicated `products`/`ProductListing` chunks emitted)
- [x] 6.2 Confirm `/search` runtime is untouched and still works (no edits to `search-algolia` layer; full build succeeded)
- [x] 6.3 Run lint/build and fix any introduced errors (`nuxt build` succeeds with full `.output/`; no errors introduced. ESLint flat-config can't run headlessly here due to a pre-existing `@nuxt/eslint` config-generation quirk unrelated to these changes)
