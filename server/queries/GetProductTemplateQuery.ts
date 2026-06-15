import productFragment from '../fragments/productFragment'
import frequentlyTogetherProductsFragment from '../fragments/frequentlyTogetherProductsFragment'
import alternativeProductsFragment from '../fragments/alternativeProductsFragment'

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
        ${frequentlyTogetherProductsFragment}
        ${alternativeProductsFragment}
    }
  }
`
