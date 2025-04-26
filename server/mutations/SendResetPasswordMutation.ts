export default `
  mutation ($email: String!) {
    resetPassword(email: $email) {
      id
      name
      email
    }
  }
`
