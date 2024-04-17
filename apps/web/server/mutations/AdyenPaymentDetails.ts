import gql from 'graphql-tag';

export default gql`
  mutation($acquirerId: Int!, $paymentDetails: GenericScalar!, $transactionReference: String!) {
    adyenPaymentDetails(acquirerId: $acquirerId, paymentDetails: $paymentDetails, transactionReference: $transactionReference) {
        adyenPaymentDetails
    }
  }
`;
