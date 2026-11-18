const internalOrderFragment = `id
name
amountTotal
formattedAmountTotal
formattedAmountTax
formattedAmountDelivery
formattedAmountSubtotal
formattedAmountDiscounts
formattedAmountGiftCards
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
  formattedCartPrice
  formattedPriceBeforeDiscount
  formattedDiscountAmount
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
    imageUrl
    displayName
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
}
reportOrderLine {
  id
  name
  formattedPriceSubtotal
  formattedPriceUnit
  product {
    id
    name
    imageUrl
    displayName
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
}
partnerInvoice {
  id
  isPublic
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
  isPublic
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
  formattedPrice
}
partner {
  id
  email
  name
  isPublic
}
lastTransaction{
  id
  reference
  payment{
    id
    name
    paymentReference
  }
  provider
  providerReference
  state
}`

export { internalOrderFragment }

export default `
    order{
        ${internalOrderFragment}
    }
`
