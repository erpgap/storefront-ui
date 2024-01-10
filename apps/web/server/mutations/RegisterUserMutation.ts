import { gql } from '@apollo/client/core';
import { partnerFragment } from '../fragments';

export default gql`
mutation register($email: String!, $name: String!, $password: String!, $subscribeNewsletter: Boolean!) {
    register(email: $email, name: $name, password: $password, subscribeNewsletter: $subscribeNewsletter) {
      id
      name
      email
      ${partnerFragment}
    }
  }`;

