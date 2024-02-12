import { gql } from '@apollo/client/core';
import wishlistItemsFragment from '../fragments/wishlistItemsFragment';

export default gql`
  mutation($wishId: Int!){
    wishlistRemoveItem(wishId: $wishId) {
      ${wishlistItemsFragment}
    }
  }
`;
