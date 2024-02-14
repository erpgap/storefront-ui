import { gql } from '@apollo/client/core';

export default gql`
  query ($pageSize: Int = 250, $filter: CountryFilterInput = {}) {
    countries(pageSize: $pageSize, filter: $filter) {
      countries {
        id
        name
        code
        states {
          id
          name
          code
        }
      }
    }
  }
`;
