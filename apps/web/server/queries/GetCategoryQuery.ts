import { partnerFragment } from '../fragments';
import { gql } from '@apollo/client/core';

export default gql`
  query ($slug: String, $id: Int) {
    category(slug: $slug, id: $id) {
      id
      name
      slug
      childs {
        id
        name
        slug
        childs {
          id
          name
          slug
        }
      }
      parent {
        id
        name
        slug
        parent {
          id
          name
          slug
          childs {
            id
            name
            slug
            childs {
              id
              name
              slug
            }
          }
        }
      }
    }
  }
`;
