import gql from 'graphql-tag';
import orderFragment from '../fragments/orderFragment';

export default gql`
  mutation ($promo: String!) {
    applyGiftCard(promo: $promo) {
      ${orderFragment}
    }
  }
`;
