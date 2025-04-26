import wishlistItemsFragment from '../fragments/wishlistItemsFragment'

export default `
  mutation($wishId: Int!){
    wishlistRemoveItem(wishId: $wishId) {
      ${wishlistItemsFragment}
    }
  }
`
