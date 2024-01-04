import { gql } from '@apollo/client/core';
import { partnerFragment } from '../fragments';

export default gql`
mutation register($email: String!, $name: String!, $password: String!, $email: String!, $location : String!$password: String!, $phoneNumber: String!) {
    register(companyName: $companyName, firstName: $firstName, lastName: $lastName, email: $email, location: $location, password: $password,  phoneNumber: $phoneNumber) {
      id
      name
      email
      ${partnerFragment}
    }
  }`;

