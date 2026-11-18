import productCardFragment from '../fragments/productCardFragment'

export default `
query(
  $filter: ProductFilterInput
  $currentPage: Int
  $pageSize: Int = 20
  $search: String
  $sort: ProductSortInput
) {
  products(
    filter: $filter
    currentPage: $currentPage
    pageSize: $pageSize
    search: $search
    sort: $sort
  ) {
    totalCount
    minPrice
    maxPrice
    currency {
      symbol
      position
      decimalPlaces
      decimalSeparator
      thousandsSeparator
    }
    filterCounts
    attributeValues {
      id
      name
      displayType
      name
      htmlColor
      search
      attribute{
        id
        name
      }    
    }
    products {
      ${productCardFragment}
    }
  }
}
`
