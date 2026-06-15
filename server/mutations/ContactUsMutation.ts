export default `
  mutation contactUs($contactus: ContactUsParams!) {
    contactUs(contactus: $contactus) {
      id
      name
      email
      subject
      message
    }
  }
`
