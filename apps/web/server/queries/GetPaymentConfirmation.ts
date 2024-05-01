import { orderFragment } from "../fragments";
import { gql } from "@apollo/client/core";

export default gql`
  query {
    paymentConfirmation {
        ${orderFragment}
        lastTransaction{
          state
        }
      }
  }
`;
