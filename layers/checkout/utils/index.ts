const getPaymentProviderComponentName = (providerCode: string) => {
  switch (providerCode) {
    case 'adyen':
      return 'ProviderAdyen'
    case 'paypal':
      return 'ProviderPayPal'
    case 'klarna':
      return 'ProviderKarna'
    case 'demo':
      return 'ProviderDemo'
    default:
      return 'UnknownPaymentProvider'
  }
}

export { getPaymentProviderComponentName }
