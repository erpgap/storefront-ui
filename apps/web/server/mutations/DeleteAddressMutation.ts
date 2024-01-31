import { gql } from '@apollo/client/core';

export default gql`
mutation deleteAddress($address: DeleteAddressInput) {
  deleteAddress(address: $address) {
    result
  }
}`;

