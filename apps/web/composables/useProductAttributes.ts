import { VariantPrice } from '@/types/product';

export const useProductAttributes: any = () => {
  const getRegularPrice = (firstVariant: VariantPrice) => {
    if (firstVariant && firstVariant.combinationInfoVariant) {
      return firstVariant.combinationInfoVariant.price;
    }
  };

  const getSpecialPrice = (firstVariant: VariantPrice) => {
    if (firstVariant && firstVariant.combinationInfoVariant.has_discounted_price) {
      return firstVariant.combinationInfoVariant.list_price;
    }
  };
  return { getRegularPrice, getSpecialPrice };
};
