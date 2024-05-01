import { gql } from "@apollo/client/core";

export default gql`
  query {
    paymentProviders {
      id
      name
      paymentMethods {
        id
        name
        image
        brands {
          id
          name
          image
        }
      }
    }
  }
`;
