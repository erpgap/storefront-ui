

export default `
  mutation newsletterSubscribe($email: String!) {
    newsletterSubscribe(email: $email) {
      subscribed
    }
  }
`
