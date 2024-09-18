import gql from "graphql-tag";
import orderFragment from "../fragments/orderFragment";

export default gql`
  mutation($shippingMethodId: Int!){
    setShippingMethod(shippingMethodId: $shippingMethodId){
      ${orderFragment}
    }
  }
`;
