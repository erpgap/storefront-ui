import gql from 'graphql-tag';

export default gql`
  mutation($acquirerId: Int!, $accessToken: String!, $browserInfo: GenericScalar!, $paymentMethod: GenericScalar!, $transactionReference: String!) {
    adyenPayments(acquirerId: $acquirerId, accessToken: $accessToken, browserInfo: $browserInfo, paymentMethod: $paymentMethod, transactionReference: $transactionReference) {
        adyenPayments
    }
  }
`;
