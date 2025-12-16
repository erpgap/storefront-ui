export default  
`query GetHomePageData(
    $currentPage: Int = 1
    $pageSize: Int = 6
  ) {
    websiteHomepage {
      metaTitle
      metaImage
      metaImageFilename
      metaKeyword
      metaDescription
      jsonLd
    }

    categories: categories(
      currentPage: $currentPage,
      pageSize: $pageSize
    ) {
      categories {
        id
        name
        slug
        imageFilename
        childs {
          id
          name
          slug
          imageFilename
        }
        parent { id name slug }
      }
    }
  }
`
