export interface Discount {
  list_price?: string;
  has_discounted_price?: boolean;
  price?: string;
}
export interface VariantPrice {
  combinationInfoVariant: Discount;
}
export interface ProductFilterType {
  filterName: string;
  id: string;
  label: string;
}
