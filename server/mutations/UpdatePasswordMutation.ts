import { gql } from '@apollo/client/core';
import { partnerFragment } from '../fragments';
export default gql`
mutation($currentPassword: String!, $newPassword: String!){
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      id
      name
      email
      ${partnerFragment}
    }
  }
`;
