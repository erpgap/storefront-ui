import { gql } from '@apollo/client/core';
import wishlistItemsFragment from '../fragments/wishlistItemsFragment';

export default gql`
  mutation($productId: Int!) {
    wishlistAddItem(productId: $productId) {
      ${wishlistItemsFragment}
    }
  }
`;
