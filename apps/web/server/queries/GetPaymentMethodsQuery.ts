import { gql } from '@apollo/client/core';

export default gql`
  query {
    paymentAcquirers {
      id
      provider
      name
      displayAs
      paymentIcons {
        id
        name
        image
      }
    }
  }
`;
