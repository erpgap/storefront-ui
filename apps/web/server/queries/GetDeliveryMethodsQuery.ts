import { gql } from '@apollo/client/core';

export default gql`
  query {
    deliveryMethods {
      id
      name
      price
      image
      imageFilename
    }
  }
`;
