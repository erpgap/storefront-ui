export default `
  query {
    paymentProviders {
      id
      name
      code
      paymentMethods {
        id
        name
        image
        brands {
          id
          name
          image
        }
      }
    }
  }
`
