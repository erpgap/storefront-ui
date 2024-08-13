const internalOrderFragment = `id
name
amountTotal
amountTax
amountDelivery
amountSubtotal
amountDiscounts
amountGiftCards
coupons {
  id
  code
}
giftCards {
  id
  code
}
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
  coupon {
    id
  code
  }
  giftCard {
    id
    code
  }
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
reportOrderLine {
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
  isPublic
}`;

export { internalOrderFragment };

export default `
    order{
        ${internalOrderFragment}
    }
`;
