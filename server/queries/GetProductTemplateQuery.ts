import { gql } from '@apollo/client/core'
import productFragment from '../fragments/productFragment'

export default gql`
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
