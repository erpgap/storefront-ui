export default `
wishlistItems {
    id
    product {
      id
      name
      description
      image
      imageUrl
      price
      imageFilename
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
