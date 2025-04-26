
import orderFragment from '../fragments/orderFragment'

export default `
  mutation($shippingMethodId: Int!){
    setShippingMethod(shippingMethodId: $shippingMethodId){
      ${orderFragment}
    }
  }
`
