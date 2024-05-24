import { partnerFragment } from '../fragments';
import { gql } from '@apollo/client/core';

export default gql`
  query LoadUser {
    ${partnerFragment}
  }
`;
