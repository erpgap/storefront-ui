const internalOrderFragment = `id
name
amountTotal
amountTax
amountDelivery
amountSubtotal
dateOrder
orderUrl
stage
transactions {
  state
}
websiteOrderLine {
  id
  name
  priceSubtotal
  product {
    id
    name
    image
    imageFilename
    displayName
    combinationInfo
    slug
    variantAttributeValues{
      id
      name
      attribute{
        name
      }
    }
  }
  quantity
  priceTotal
}
orderLines {
  id
  name
  priceSubtotal
  product {
    id
    name
    image
    imageFilename
    displayName
    combinationInfo
    slug
    variantAttributeValues{
      id
      name
      attribute{
        name
      }
    }
  }
  quantity
  priceTotal
}
partnerInvoice {
  id
  name
  street
  city
  phone
  zip
  country {
    id
    name
  }
  state {
    id
    name
  }
  addressType
}
partnerShipping {
  id
  name
  street
  city
  phone
  zip
  country {
    id
    name
  }
  state { 
    id
    name
  }
  addressType
}
shippingMethod{
  id
  name
  price
}
partner {
  id
  email
  name
}`;

export { internalOrderFragment };

export default `
    order{
        ${internalOrderFragment}
    }
`;
