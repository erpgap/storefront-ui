
import orderFragment from '../fragments/orderFragment'

export default `
  mutation($lineIds: [Int]!){
    cartRemoveMultipleItems(lineIds: $lineIds) {
      ${orderFragment}
    }
  }
`
