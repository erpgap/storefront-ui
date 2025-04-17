export default `
  frequentlyBoughtTogether {
    id
    name
    displayName
    price
    description
    image
    imageFilename
    slug
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
  }
`