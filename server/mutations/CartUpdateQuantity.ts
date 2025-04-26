
import orderFragment from '../fragments/orderFragment'

export default `
mutation($lines: [CartLineInput]!){
  cartUpdateMultipleItems(lines: $lines) {
      ${orderFragment}
    }
  }
`
