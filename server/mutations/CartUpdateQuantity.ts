import gql from 'graphql-tag'
import orderFragment from '../fragments/orderFragment'

export default gql`
mutation($lines: [CartLineInput]!){
  cartUpdateMultipleItems(lines: $lines) {
      ${orderFragment}
    }
  }
`
