/**
 * What a product card needs: the listing, best sellers and search.
 *
 * Deliberately narrower than productFragment, which serves the product page.
 * Every field here is resolved per product, and some are expensive: jsonLd
 * prices every variant, the meta and breadcrumb fields walk the category
 * tree. A card shows a name, an image, a price and a rating, so asking for
 * the rest made listing queries about three times as slow and three times as
 * large for data nothing on the page read.
 *
 * No template-level `price`: cards show firstVariant.combinationInfoVariant
 * (useProductAttributes), and Odoo prices the template and the variant
 * separately, so asking for both priced every card twice.
 */
export default `
  id
  name
  slug
  imageUrl
  ratingAvg
  ratingCount
  isInWishlist
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
  attributeValues {
    id
    name
    displayType
    priceExtra
    attribute { id name }
    search
  }
`
