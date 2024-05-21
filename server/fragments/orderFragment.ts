export default `
order {
  id
  name
  amountTotal
  amountTax
  amountDelivery
  amountSubtotal
  dateOrder
  orderUrl
  stage
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
    }
    state {
      id
    }
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
    }
    state { 
      id
    }
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
  }
  
}
`;
