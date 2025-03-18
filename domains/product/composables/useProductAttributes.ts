export const useProductAttributes: any = () => {
  const getSpecialPrice = (firstVariant: any) => {
    if (firstVariant && firstVariant.combinationInfoVariant) {
      return firstVariant.combinationInfoVariant.price;
    }
  };

  const getRegularPrice = (firstVariant: any) => {
    if (
      firstVariant &&
      firstVariant.combinationInfoVariant?.has_discounted_price
    ) {
      return firstVariant.combinationInfoVariant.list_price;
    }
  };
  return { getRegularPrice, getSpecialPrice };
};
