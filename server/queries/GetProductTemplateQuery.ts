import productFragment from '../fragments/productFragment'

export default `
  query(
    $id: Int = null
    $slug: String = null
    $barcode: String = null
  ) {
    product(
      id: $id
      slug: $slug
      barcode: $barcode
    ) {
        ${productFragment}
    }
  }
`
