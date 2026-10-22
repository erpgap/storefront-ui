export default `
  id
  ratingAvg
  ratingCount
  metaDescription
  metaImage
  metaKeyword
  metaTitle
  productVariants {
    id
    imageUrl
    mediaGallery {
      id
      imageUrl
      name
    }
}
  firstVariant {
    id
    combinationInfoVariant
    slug
    variantAttributeValues {
      id
      name
      displayType
      htmlColor
      search
      attribute { id name }
    }
  }
    variantAttributeValues {
      id
      name
      htmlColor
      attribute { id name }
    }
  name
  description
  imageUrl
  mediaGallery { 
    id 
    name 
    imageUrl
    }
  slug
  #skufalse
  isInWishlist

  categories {
    id
    name
    slug
    parent {
      id
      name
      slug
      parent {
        id
        name
        slug
        parent {
          id
          name
          slug
          parent {
            id
            name
            slug
          }
        }
      }
    }
  }

  attributeValues {
    id
    name
    displayType
    priceExtra
    attribute { id name }
    search
  }
`
