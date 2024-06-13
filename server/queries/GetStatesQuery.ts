import { gql } from "@apollo/client/core";

export default gql`
  query ($id: Int!) {
    country(id: $id) {
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
`;
