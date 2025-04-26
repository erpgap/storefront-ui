import addressFragment from '../fragments/addressFragment'

export default `
    mutation UpdateAddress($address: UpdateAddressInput!) {
        updateAddress(address: $address) {
            ${addressFragment}
        }
    }
`
