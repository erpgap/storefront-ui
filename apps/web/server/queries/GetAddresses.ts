import { gql } from '@apollo/client/core';
import addressFragment from '../fragments/addressFragment';

export default gql`
query(
  $filter: AddressFilterInput
) {
  addresses(
    filter: $filter
  ) {
    ${addressFragment}
  }
}
`;
