import { internalOrderFragment } from '../fragments/orderFragment'

export default `
  query {
    orders {
      orders {
        ${internalOrderFragment}  
      }
    }
  }
`
