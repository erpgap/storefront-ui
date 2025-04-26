import addressFragment from '../fragments/addressFragment'

export default `
query(
  $filter: AddressFilterInput
) {
  addresses(
    filter: $filter
  ) {
    ${addressFragment}
  }
}
`
