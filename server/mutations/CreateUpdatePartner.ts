import { gql } from '@apollo/client/core';
import partnerFragament from '../fragments/partnerFragment';

export default gql`
  mutation CreateUpdatePartner($name: String!, $email: String!, $subscribeNewsletter: Boolean!) {
    createUpdatePartner(name: $name, email: $email, subscribeNewsletter: $subscribeNewsletter) {
      id
      name
      email
    }
  }
`;
