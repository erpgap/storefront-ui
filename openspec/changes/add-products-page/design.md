## Context

The storefront (Nuxt layers architecture) renders product listings in two near-identical places:

- `layers/search-algolia/pages/search.vue` (route `/search`)
- `layers/category/custom-pages/category-page.vue` (data-driven category routes)

Both compose the same building blocks — `CategoryFilterSidebar` (+ mobile variant), a `LazyUiProductCard` grid, `LazyUiPagination`, `CategoryEmptyState`, a loading state — backed by `useProductTemplateList` (GraphQL → Odoo) and a `getFacetsFromURL` helper that maps the URL query into `QueryProductsArgs`.

Two divergent copies of that helper exist:
- `layers/category/composables/useUiHelpers.ts` — newer, richer (price, Availability/inStock, `selectedFilters` state), `pageSize` default **20**, `categorySlug` → `null` for `/` and `/search`.
- `layers/search-algolia/utils/uiHelpers.ts` — older, simpler, `pageSize` default **12**.

Routes are registered either as static page files (auto-discovered) or via `modules/routes-generator` (for data-driven slugs: categories, products, CMS pages). `/products` is a fixed, known route, not data-driven.

There are no existing OpenSpec specs yet (`openspec/specs/` is empty).

## Goals / Non-Goals

**Goals:**
- Ship a public, indexable `/products` PLP that lists the full catalog with pagination, sorting, filtering, and SSR/SWR.
- Extract the shared listing UI into a `ProductListing` component to stop the listing duplication from growing to a third copy.
- Keep blast radius small: do not touch the `/search` runtime in this change.
- Reuse the category `getFacetsFromURL` (the newer copy) for `/products`.

**Non-Goals:**
- Migrating `/search` + `useSearch` to the shared component or unifying the two `getFacetsFromURL` copies (deferred follow-up).
- Campaign/collection landing pages (e.g. `/products?collection=summer`).
- Any change to the GraphQL schema or Odoo backend.

## Decisions

**1. New `layers/products` layer with a static `pages/products.vue`.**
`/products` is a fixed route, so a real page file is the conventional fit; `routes-generator` is reserved for data-driven slugs. A dedicated layer keeps catalog-browse concerns isolated and gives the page a clear home (no existing "catalog" layer). Alternatives: putting it in `category` or `search-algolia` (rejected — muddies those layers' responsibilities).

**2. Extract `ProductListing.vue` as the shared presentation component.**
It encapsulates the filter sidebar (desktop + mobile), product grid, pagination, empty state, and loading. It consumes `useProductTemplateList` + `getFacetsFromURL` and exposes props for the page-specific bits: optional breadcrumbs, optional heading, SEO entity, and items-per-page. `/products` and `category-page.vue` consume it now; `/search` migrates later. Alternative: copy the pattern into a third page file (rejected — adds debt the user explicitly asked to pay down via "refact").

**3. `/products` scopes to the full catalog via `categorySlug: null`.**
Reuse the category `getFacetsFromURL`, extending its `pathToSlug()`/null logic so `/products` is treated like `/` and `/search` (returns `null` → full catalog with facets). Single recognized list of "global" routes to avoid further drift.

**4. Pagination: 20 items per page.**
Matches the category page's current value and the category helper default. Search's `12` is left as-is (out of scope).

**5. SEO: indexable with canonical discipline.**
`/products` gets `useHead` title/description and a self-canonical. Filtered/paginated variants (`?page=2`, `?Color=red`) set `rel="canonical"` back to the base `/products` to consolidate indexing signals. Add `routeRules['/products'] = { swr: <NUXT_SWR_CACHE_TIME> }` in the root `nuxt.config` for SSR/SWR caching, consistent with how `routes-generator` applies SWR elsewhere.

## Risks / Trade-offs

- **Refactoring `category-page.vue` could regress category behavior** → Extract conservatively, preserving the existing markup/props; verify category routes still render grid, filters, pagination, and SEO unchanged before merging.
- **Two `getFacetsFromURL` copies remain after this change** → Accepted, by Path B choice. Documented as a follow-up so the search migration consolidates them; `/products` deliberately uses the category copy to avoid a third divergence.
- **Auto-import name collisions** (`useUiHelpers`/`uiHelpers` exist in two layers) → The shared component imports the category helper explicitly (as `category-page.vue` already does) rather than relying on auto-import resolution.
- **Indexing thin/duplicate filtered pages** → Mitigated by canonical-to-base on filtered/paginated variants.

## Migration Plan

1. Add `layers/products` + `ProductListing.vue` (additive, no behavior change).
2. Refactor `category-page.vue` to consume `ProductListing` (behavior-preserving).
3. Add `/products` `routeRules` SWR + SEO.
4. Rollback: revert the layer + the `category-page.vue` refactor commit; `routeRules` removal drops `/products` cleanly since no other code depends on it.
