import { readonly } from 'vue'

export const useCheckout = () => {
  // Per request, not a module-level ref: on the server one ref is shared by
  // every page being rendered, so one shopper's loading could render another's
  // Place order button disabled, and Vue does not undo that on hydration.
  const loading = useState('checkout-loading', () => false)

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  return {
    loading: readonly(loading),
    setLoading,
  }
}
