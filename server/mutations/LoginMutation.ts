import { gql } from '@apollo/client/core'
import { partnerFragment } from '../fragments'

export default gql`
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
       ${partnerFragment}
      }
    }
  }
`
