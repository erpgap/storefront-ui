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
    imageUrl
    mediaGallery {
      id
      image
      imageFilename
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
  smallImage
  price
  name
  description
  image
  imageFilename
  imageUrl
  mediaGallery { 
    id 
    name 
    image 
    imageFilename 
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
