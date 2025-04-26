import addressFragment from '../fragments/addressFragment'

export default `
mutation selectAddress ($address: SelectAddressInput!, $type: AddressEnum!) {
      selectAddress(address: $address, type: $type) {
        ${addressFragment}
    }
  }
`
