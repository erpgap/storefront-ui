import productFragment from './fragments/productFragment';
import { gql } from '@apollo/client/core';

export default gql`
query {
  wishlistItems {
    totalCount
    wishlistItems {
        id
        product {
            ${productFragment}
        }
    } 
  }
}
`;
