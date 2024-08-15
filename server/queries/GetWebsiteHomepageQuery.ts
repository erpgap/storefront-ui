import { gql } from '@apollo/client/core';

export default gql`
  query {
    websiteHomepage {
      metaTitle
      metaImage
      metaImageFilename
      metaKeyword
      metaDescription
      jsonLd
    }
  }
`;
