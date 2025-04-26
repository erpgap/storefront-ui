import { partnerFragment } from '../fragments'

export default `
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
       ${partnerFragment}
      }
    }
  }
`
