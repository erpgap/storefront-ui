import { gql } from '@apollo/client/core';
import addressFragment from '../fragments/addressFragment';

export default gql`
query(
  $id: Int,
) {
  country(
    id: $id
  ) {
    states {
        id
        name
        code
    }
  }
}
`;
