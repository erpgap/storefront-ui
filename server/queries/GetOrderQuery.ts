import { internalOrderFragment } from '../fragments/orderFragment'

export default `
query ($id: Int!) {
  order(id: $id){
    ${internalOrderFragment}  
  } 
}
`
