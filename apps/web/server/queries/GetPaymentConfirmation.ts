import { gql } from '@apollo/client/core';
import { orderFragment } from '../fragments';

export default gql`
  query {
    paymentConfirmation {
        ${orderFragment}
      }
  }
`;
