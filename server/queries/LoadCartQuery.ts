import { orderFragment } from '../fragments'
import frequentlyTogetherProductsFragment from '../fragments/frequentlyTogetherProductsFragment'

export default `
  query {
    cart {
      ${orderFragment}
      ${frequentlyTogetherProductsFragment}
    }
  }
`
