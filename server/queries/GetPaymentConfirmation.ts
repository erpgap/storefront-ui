import { orderFragment } from '../fragments'

export default `
  query {
    paymentConfirmation {
      ${orderFragment}
      order {
        confirmationEmail
      }
    }
  }
`
