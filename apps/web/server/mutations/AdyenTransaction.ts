import gql from "graphql-tag";

export default gql`
  mutation ($acquirerId: Int!, $tokenizationRequested: Boolean = false) {
    adyenTransaction(
      acquirerId: $acquirerId
      tokenizationRequested: $tokenizationRequested
    ) {
      transaction
    }
  }
`;
