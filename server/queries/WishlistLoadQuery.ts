import { gql } from '@apollo/client/core';
import wishlistItemsFragment from '../fragments/wishlistItemsFragment';

export default gql`
  query {
    wishlistItems {
      ${wishlistItemsFragment}
    }
  }
`;
