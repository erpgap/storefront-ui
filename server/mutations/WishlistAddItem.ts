import wishlistItemsFragment from '../fragments/wishlistItemsFragment'

export default `
  mutation($productId: Int!) {
    wishlistAddItem(productId: $productId) {
      ${wishlistItemsFragment}
    }
  }
`
