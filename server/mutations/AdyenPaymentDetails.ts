export default `
  mutation (
    $providerId: Int!
    $paymentDetails: GenericScalar!
    $transactionReference: String!
  ) {
    adyenPaymentDetails(
      providerId: $providerId
      paymentDetails: $paymentDetails
      transactionReference: $transactionReference
    ) {
      adyenPaymentDetails
    }
  }
`
