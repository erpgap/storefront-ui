import { gql } from "@apollo/client/core";

export default gql`
  mutation DeleteAddress($address: DeleteAddressInput!) {
    deleteAddress(address: $address) {
      result
    }
  }
`;
