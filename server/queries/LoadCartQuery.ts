import { orderFragment } from '../fragments'

export default `
  query {
    cart {
      ${orderFragment}
    }
  }
`
