import alternativeProductsFragment from './alternativeProductsFragment'
import frequentlyTogetherProductsFragment from './frequentlyTogetherProductsFragment'

export default `
  id
  breadcrumb
  jsonLdBreadcrumb
  metaDescription
  metaImage
  metaKeyword
  metaTitle
  jsonLd
  firstVariant{
    id
    combinationInfoVariant
    slug
    variantAttributeValues{
      id
      name
      displayType
      name
      htmlColor
      search
      attribute{
        id
        name
      }
    }
  }
  ${alternativeProductsFragment}
  ${frequentlyTogetherProductsFragment}
  smallImage
  price
  name
  description
  image
  imageFilename
  mediaGallery{
    id
    name
    image
    imageFilename
  }
  combinationInfo
  slug
  sku 
  isInWishlist
  categories {
    id
    name
    slug
    parent{
      parent{
        id
      }
    }
  }
  attributeValues {
    id
    name
    displayType
    priceExtra
    attribute {
      id
      name
    }
    search
  }
`
