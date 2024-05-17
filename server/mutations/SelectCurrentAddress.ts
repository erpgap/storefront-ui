import { gql } from "@apollo/client/core";
import addressFragment from "../fragments/addressFragment";

export default gql`
mutation selectAddress ($address: SelectAddressInput!, $type: AddressEnum!) {
      selectAddress(address: $address, type: $type) {
        ${addressFragment}
    }
  }
`;
