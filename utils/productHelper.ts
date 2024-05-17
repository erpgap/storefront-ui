import { Product } from '~/graphql';

export const mountUrlSlugForProductVariant = (product: Product): string => {
  const params =
    product?.variantAttributeValues
      ?.map((variantAttributeValue) => `${variantAttributeValue?.attribute?.name}=${variantAttributeValue?.id}&`)
      ?.join('') || '';

  const joinedSlug = `${product?.slug || ''}?${params}`;
  return joinedSlug.slice(0, -1);
};
