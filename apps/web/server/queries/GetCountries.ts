import { gql } from '@apollo/client/core';
import addressFragment from '../fragments/addressFragment';

export default gql`
query(
  $filter: CountryFilterInput,
  $currentPage: Int,
  $pageSize: Int,
  $search: String,
) {
  countries(
    filter: $filter,
    currentPage: $currentPage,
    pageSize: $pageSize,
    search: $search
  ) {
    countries {
        id
        name
        code
        imageUrl
    }
  }
}
`;
