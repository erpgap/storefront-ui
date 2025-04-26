

export default `
  mutation ($providerId: Int!) {
    adyenPaymentMethods(providerId: $providerId) {
      adyenPaymentMethods
    }
  }
`
