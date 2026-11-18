export default `
wishlistItems {
    id
    product {
      id
      name
      description
      imageUrl
      ratingAvg
      ratingCount
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
