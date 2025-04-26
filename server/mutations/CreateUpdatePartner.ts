import partnerFragament from '../fragments/partnerFragment'

export default `
  mutation CreateUpdatePartner(
    $name: String!
    $email: String!
    $subscribeNewsletter: Boolean!
  ) {
    createUpdatePartner(
      name: $name
      email: $email
      subscribeNewsletter: $subscribeNewsletter
    ) {
      id
      name
      email
      isPublic
    }
  }
`
