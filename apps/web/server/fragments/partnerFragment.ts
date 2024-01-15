import billingAddressFragment from './billingAddressFragment';

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
    email
    phone
    ${billingAddressFragment}
  }
`;
