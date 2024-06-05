import gql from "graphql-tag";
export default gql`
  mutation newsletterSubscribe($email: String!) {
    newsletterSubscribe(email: $email) {
      subscribed
    }
  }
`;
