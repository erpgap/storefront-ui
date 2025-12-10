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
  productVariants {
    id
    image
    mediaGallery {
      id
      image
      imageFilename
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
  smallImage
  price
  name
  description
  image
  imageFilename
  mediaGallery { 
    id 
    name 
    image 
    imageFilename 
    }
  combinationInfo
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
