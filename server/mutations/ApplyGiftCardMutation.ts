import gql from 'graphql-tag';

export default gql`
  mutation ($promo: String!) {
    applyGiftCard(promo: $promo) {
      error
    }
  }
`;
