import { gql } from "@apollo/client/core";

export default gql`
  query {
    paymentProviders {
      id
      name
      code
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
