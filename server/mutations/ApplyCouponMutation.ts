
import orderFragment from '../fragments/orderFragment'

export default `
  mutation ($promo: String!) {
    applyCoupon(promo: $promo) {
      ${orderFragment}
    }
  }
`
