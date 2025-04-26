

export default `
  mutation ($providerId: Int!) {
    adyenProviderInfo(providerId: $providerId) {
      adyenProviderInfo
    }
  }
`
