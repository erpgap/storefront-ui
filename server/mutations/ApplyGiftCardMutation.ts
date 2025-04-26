import orderFragment from '../fragments/orderFragment'

export default `
  mutation ($promo: String!) {
    applyGiftCard(promo: $promo) {
      ${orderFragment}
    }
  }
`
