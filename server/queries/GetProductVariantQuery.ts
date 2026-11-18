export default `
  query ProductVariant($productTemplateId: Int, $combinationId: [Int]) {
    productVariant(
      productTemplateId: $productTemplateId
      combinationId: $combinationId
    ) {
      product {
        id
        name
        description
        imageUrl
        mediaGallery{
          id
          imageUrl
        }
        combinationInfoVariant
        slug
        metaTitle
        metaImage
        metaKeyword
        metaDescription
        jsonLd
        isInWishlist
        categories {
          id
          name
          slug
          parent {
            parent {
              id
            }
          }
        }
      }
      productTemplateId
      displayName
    }
  }
`
