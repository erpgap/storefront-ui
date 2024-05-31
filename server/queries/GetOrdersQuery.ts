import { gql } from "@apollo/client/core";
import { internalOrderFragment } from "../fragments/orderFragment";

export default gql`
  query {
    orders {
      orders {
        ${internalOrderFragment}  
      }
    }
  }
`;
