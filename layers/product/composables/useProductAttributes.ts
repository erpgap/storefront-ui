export const useProductAttributes: any = () => {
  const getSpecialPrice = (firstVariant: any) => {
    return firstVariant?.combinationInfoVariant?.price || 0
  }

  const getRegularPrice = (firstVariant: any) => {
    return firstVariant?.combinationInfoVariant?.has_discounted_price ? firstVariant?.combinationInfoVariant?.list_price : 0
  }
  return { getRegularPrice, getSpecialPrice }
}
