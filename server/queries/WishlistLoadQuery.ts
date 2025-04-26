import wishlistItemsFragment from '../fragments/wishlistItemsFragment'

export default `
  query {
    wishlistItems {
      ${wishlistItemsFragment}
    }
  }
`
