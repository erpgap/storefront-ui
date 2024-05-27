import { gql } from "@apollo/client/core";

export default gql`
  query {
    orders {
      orders {
        id
        dateOrder
        amountTotal
        invoiceStatus
      }
    }
  }
`;
