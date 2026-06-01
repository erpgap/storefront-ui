## ADDED Requirements

### Requirement: Shared product listing component

The system SHALL provide a reusable `ProductListing` component that encapsulates the product-listing presentation — filter sidebar (desktop and mobile), product grid, pagination, empty state, and loading state — independent of the route that hosts it.

#### Scenario: Rendering a listing from query state

- **WHEN** the component is mounted on a listing route
- **THEN** it derives query arguments from the URL via the shared `getFacetsFromURL` helper
- **AND** loads products through `useProductTemplateList`
- **AND** renders the filter sidebar, product grid, and pagination

#### Scenario: Loading state

- **WHEN** a product fetch is in progress
- **THEN** the component shows a loading indicator instead of the grid

#### Scenario: Empty results

- **WHEN** the fetch returns no products
- **THEN** the component renders the shared empty state

### Requirement: Configurable page-specific presentation

The `ProductListing` component SHALL accept props for page-specific presentation so different routes can reuse it, including optional breadcrumbs, an optional heading, SEO entity input, and items-per-page.

#### Scenario: Products page configuration

- **WHEN** `ProductListing` is used by `/products`
- **THEN** it renders "Products" breadcrumbs and uses 20 items per page

#### Scenario: Category page configuration

- **WHEN** `ProductListing` is used by the category page
- **THEN** it renders the category's breadcrumbs and SEO entity
- **AND** preserves the category page's existing observable behavior (grid, filters, pagination)

### Requirement: Explicit helper import to avoid auto-import collisions

The `ProductListing` component SHALL import the category `getFacetsFromURL` helper explicitly rather than relying on auto-import resolution, because multiple layers define helpers of the same name.

#### Scenario: Deterministic helper resolution

- **WHEN** the component builds query arguments
- **THEN** it uses the explicitly imported category `useUiHelpers` `getFacetsFromURL`
- **AND** does not depend on auto-import ordering between layers
