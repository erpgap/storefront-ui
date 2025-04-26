
import orderFragment from '../fragments/orderFragment'

export default `
  mutation($products: [ProductInput]!){
    cartAddMultipleItems(products: $products){
      ${orderFragment}
    }
  }
`
