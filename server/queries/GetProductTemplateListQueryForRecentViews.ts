export default `
query (
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
    products {      
      firstVariant {
        id
        combinationInfoVariant         
      }
      tags {        
        name
        image
        imageFilename
      }
      image
      name
      slug      
    }
  }
}
`
