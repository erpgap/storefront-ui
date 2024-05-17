const getPaymentProviderComponentName = (providerCode: string) => {
  switch (providerCode) {
    case "adyen":
      return "ProviderAdyen";
    case "paypal":
      return "ProviderPayPal";
    case "klarna":
      return "ProviderKarna";
    default:
      return "UnknownPaymentProvider";
  }
};

export { getPaymentProviderComponentName };
