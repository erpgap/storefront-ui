import { partnerFragment } from '../fragments'

export default `
mutation($currentPassword: String!, $newPassword: String!){
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      id
      name
      email
      ${partnerFragment}
    }
  }
`
