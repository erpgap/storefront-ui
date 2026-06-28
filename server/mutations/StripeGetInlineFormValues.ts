export default `
  mutation ($providerId: Int!) {
    stripeGetInlineFormValues(providerId: $providerId) {
      stripeGetInlineFormValues
    }
  }
`
