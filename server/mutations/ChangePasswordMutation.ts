export default `
  mutation ($newPassword: String!, $token: String!) {
    changePassword(newPassword: $newPassword, token: $token) {
      id
      name
      email
    }
  }
`
