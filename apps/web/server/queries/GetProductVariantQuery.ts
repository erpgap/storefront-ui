import { gql } from '@apollo/client/core';
export default gql`
    query ProductVariant($productTemplateId: Int, $combinationId: [Int]) {
        productVariant( productTemplateId: $productTemplateId combinationId: $combinationId) {
            product {
                id
                smallImage
                price
                name
                description
                image
                imageFilename
                combinationInfoVariant
                slug
                jsonLd
                isInWishlist
                categories {
                    id
                    name
                    slug
                    parent{
                    parent{
                        id
                    }
                    }
                }
            }
            productTemplateId
            displayName
            price
            listPrice
            hasDiscountedPrice
        }
    }`;
