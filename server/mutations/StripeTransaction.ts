export default `
  mutation ($providerId: Int!, $tokenizationRequested: Boolean = false) {
    stripeTransaction(
      providerId: $providerId
      tokenizationRequested: $tokenizationRequested
    ) {
      transaction
    }
  }
`
