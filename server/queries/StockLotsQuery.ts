import { gql } from '@apollo/client/core';

export default gql`
  query ($filter: StockLotFilterInput, $currentPage: Int, $pageSize: Int = 0) {
    stockLots(filter: $filter, currentPage: $currentPage, pageSize: $pageSize) {
      totalCount
      stockLots {
        partNumber
        name
        productQty
        internalReference
        product {
          id
          name
          qty
          name
          displayName
          sku
          description
          metaTitle
          showAvailableQty
        }
      }
    }
  }
`;
