import { gql } from '@apollo/client/core';
import addressFragment from '../fragments/addressFragment';

export default gql`
    mutation UpdateAddress($address: UpdateAddressInput!) {
        updateAddress(address: $address) {
            ${addressFragment}
        }
    }
`;
