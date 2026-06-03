## Why

Customers can currently only discover products through category navigation, search (`/search`), homepage sections, or direct links. There is no centralized page to browse the entire catalog, which limits product discoverability, SEO indexing, and general browsing — especially on mobile. A dedicated `/products` page closes that gap.

## What Changes

- Add a new public, indexable route at `/products` that lists all visible/sellable products as a Product Listing Page (PLP).
- Support pagination, sorting, and attribute/price filtering on `/products`, reusing the existing data flow (`useProductTemplateList` + `getFacetsFromURL`).
- Introduce a new `layers/products` Nuxt layer that owns the page (`pages/products.vue`) as a thin wrapper.
- Extract the duplicated category/search listing UI (filter sidebar, product grid, pagination, empty state, loading) into a shared `ProductListing` component consumed by `/products` and the category page. The `/search` page is refactored to consume it in a later change (out of scope here).
- Treat `/products` like `/search` for catalog scoping: `categorySlug` resolves to `null` so the query returns the full catalog with facets.
- Add an SWR `routeRules` entry for `/products` and proper SEO (`useHead` title/description + canonical).

## Capabilities

### New Capabilities
- `product-browse`: Public `/products` PLP that lists the full catalog with pagination, sorting, filtering, SSR/SWR rendering, and SEO.
- `product-listing-ui`: A shared, reusable product-listing presentation component (filters + grid + pagination + empty/loading states) decoupled from the route that hosts it.

### Modified Capabilities
<!-- No existing OpenSpec specs are defined yet (openspec/specs/ is empty), so there are no spec-level requirement deltas to record. The category page is refactored to consume the new shared component, but its observable behavior is preserved. -->

## Impact

- **New**: `layers/products/` (`pages/products.vue`, `nuxt.config.ts`), shared `ProductListing.vue` component, `/products` SEO + canonical handling.
- **Modified**: root `nuxt.config` `routeRules` (add `/products` SWR); `layers/category/custom-pages/category-page.vue` refactored to render the shared component (behavior preserved).
- **Reused (unchanged)**: `useProductTemplateList`, `getFacetsFromURL` (category copy), `CategoryFilterSidebar`, `CategoryMobileSidebar`, `LazyUiProductCard`, `LazyUiPagination`, `CategoryEmptyState`.
- **Explicitly out of scope**: migrating `/search` + `useSearch` to the shared component/helper; campaign/collection landing pages.
