export default `
  mutation DeleteAddress($address: DeleteAddressInput!) {
    deleteAddress(address: $address) {
      result
    }
  }
`
