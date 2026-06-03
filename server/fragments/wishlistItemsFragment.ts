export default `
wishlistItems {
    id
    product {
      id
      name
      description
      imageUrl
      price
      isInWishlist
      variantAttributeValues{
        id
        name
        attribute{
          id
          name
        }
      }
      combinationInfoVariant
      slug
    }
  }
`
