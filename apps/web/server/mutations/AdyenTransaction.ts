import gql from "graphql-tag";

export default gql`
  mutation ($providerId: Int!, $tokenizationRequested: Boolean = false) {
    adyenTransaction(
      providerId: $providerId
      tokenizationRequested: $tokenizationRequested
    ) {
      transaction
    }
  }
`;
