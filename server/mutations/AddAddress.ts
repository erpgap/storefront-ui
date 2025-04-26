import addressFragment from '../fragments/addressFragment'

export default `
    mutation AddAddress($address: AddAddressInput!, $type: AddressEnum!) {
        addAddress(address: $address, type: $type) {
            ${addressFragment}
        }
    }
`
