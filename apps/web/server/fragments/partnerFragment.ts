export default `
partner{
    id
    name
    street
    street2
    city
    state
    {
      id
      name
    }
    country
    {
      id
      name
    }
    billingAddress {
      id 
      name
    }
    shippingAddress {
      id
      name
    }
    email
    phone
  }
`;
