## ADDED Requirements

### Requirement: Public products listing route

The system SHALL expose a public route at `/products` that renders a Product Listing Page showing all visible/sellable products in the catalog.

#### Scenario: Visiting the products page

- **WHEN** a user navigates to `/products` with no query parameters
- **THEN** the system renders a listing of published products scoped to the full catalog (category scope is `null`)
- **AND** the first page of results is shown

#### Scenario: Server-side rendering with SWR caching

- **WHEN** `/products` is requested
- **THEN** the page is server-side rendered
- **AND** the response is cached using the configured SWR route rule for `/products`

### Requirement: Pagination on the products listing

The products page SHALL paginate results at 20 products per page and allow navigation between pages via the URL.

#### Scenario: Navigating to a subsequent page

- **WHEN** a user requests `/products?page=2`
- **THEN** the system displays the second page of results (products 21–40)
- **AND** the pagination control reflects page 2 as active

#### Scenario: Total count reflects full catalog

- **WHEN** the products page loads
- **THEN** the displayed total product count equals the total number of published products matching the active filters

### Requirement: Sorting on the products listing

The products page SHALL allow users to sort results, with the active sort encoded in the URL query.

#### Scenario: Applying a sort

- **WHEN** a user selects a sort option
- **THEN** the URL query updates to include the chosen `sort`
- **AND** the listing re-fetches and renders in the selected order

### Requirement: Filtering on the products listing

The products page SHALL allow users to filter results by product attributes and price, with active filters encoded in the URL query and reflected in the listing.

#### Scenario: Applying an attribute filter

- **WHEN** a user selects an attribute facet value
- **THEN** the URL query updates with the selected filter
- **AND** the listing re-fetches showing only matching products
- **AND** the displayed total count updates accordingly

#### Scenario: Applying a price range filter

- **WHEN** a user applies a price range
- **THEN** the listing re-fetches showing only products within the range

#### Scenario: No products match the filters

- **WHEN** the active filters return no products
- **THEN** the system shows the empty state instead of an empty grid

### Requirement: Products page SEO

The products page SHALL be indexable and provide SEO metadata, with canonical handling that consolidates filtered and paginated variants.

#### Scenario: Base page metadata

- **WHEN** `/products` is rendered
- **THEN** the page sets an SEO title and meta description
- **AND** declares a self-referential canonical URL of `/products`

#### Scenario: Canonical on filtered or paginated variants

- **WHEN** `/products` is rendered with filter or `page` query parameters
- **THEN** the canonical URL points to the base `/products`

### Requirement: Mobile responsiveness

The products page SHALL be responsive, exposing filters through a mobile sidebar on small viewports.

#### Scenario: Opening filters on mobile

- **WHEN** a user on a small viewport taps the filter trigger
- **THEN** the system opens the mobile filter sidebar
- **AND** applying a filter updates the listing and closes the sidebar as on other listing pages
