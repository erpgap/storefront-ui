import gql from 'graphql-tag'

export default gql`
  mutation ($providerId: Int!) {
    adyenPaymentMethods(providerId: $providerId) {
      adyenPaymentMethods
    }
  }
`
