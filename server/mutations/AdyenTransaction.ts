export default `
  mutation ($providerId: Int!, $tokenizationRequested: Boolean = false) {
    adyenTransaction(
      providerId: $providerId
      tokenizationRequested: $tokenizationRequested
    ) {
      transaction
    }
  }
`
