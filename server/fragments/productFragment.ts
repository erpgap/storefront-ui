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
  smallImage
  price
  name
  description
  image
  imageFilename
  mediaGallery { id name image imageFilename }
  combinationInfo
  slug
  sku
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
