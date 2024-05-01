import gql from "graphql-tag";

export default gql`
  mutation ($providerId: Int!) {
    adyenProviderInfo(providerId: $providerId) {
      adyenProviderInfo
    }
  }
`;
