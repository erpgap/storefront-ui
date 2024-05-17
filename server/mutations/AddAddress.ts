import { gql } from '@apollo/client/core';
import addressFragment from '../fragments/addressFragment';

export default gql`
    mutation AddAddress($address: AddAddressInput!, $type: AddressEnum!) {
        addAddress(address: $address, type: $type) {
            ${addressFragment}
        }
    }
`;
