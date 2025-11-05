export default  `
  query GetHomePageData(
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
        childs {
          id
          name
          slug
        }
        parent { id name slug }
      }
    }


  }
`
