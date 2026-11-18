// A variant's prices as Odoo formats them (combinationInfoVariant).
export const useProductAttributes: any = () => {
  const getSpecialPrice = (firstVariant: any): string => {
    return firstVariant?.combinationInfoVariant?.formatted_price ?? ''
  }

  const getRegularPrice = (firstVariant: any): string => {
    const info = firstVariant?.combinationInfoVariant
    return info?.has_discounted_price ? info?.formatted_list_price ?? '' : ''
  }
  return { getRegularPrice, getSpecialPrice }
}
