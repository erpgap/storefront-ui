import { useToast } from 'vue-toastification'
import type {
  Cart,
  CartAddItemResponse,
  CartRemoveItemResponse,
  CartUpdateItemResponse,
  MutationCartAddMultipleItemsArgs,
  MutationCartRemoveMultipleItemsArgs,
  MutationCartUpdateMultipleItemsArgs,
  Product,
} from '~~/graphql'
import { MutationName } from '~~/server/mutations'

export const useCart = () => {
  const { $sdk } = useNuxtApp()
  const cartCounter = useCookie<number>('cart-counter')
  const toast = useToast()
  const { openCartSideBar } = useCartUiState()
  const cart = useState<Cart>('cart', () => (({}) as Cart))
  const frequentlyTogetherProducts = useState<Product[]>('frequently-together-products', () => [])

  const cartError = ref('')

  const applyCart = (payload?: { cart?: Cart } | null) => {
    if (!payload?.cart)
      return

    cart.value = payload.cart
    cartCounter.value = Number(payload.cart?.order?.websiteOrderLine?.length || 0)
    frequentlyTogetherProducts.value = (payload.cart.frequentlyBoughtTogether || []).filter((p: null): p is Product => p !== null)
  }

  const {
    data,
    status,
    error,
    refresh: refreshCart,
  } = useAsyncData<{ cart: Cart }>(
    'cart',
    () => useRequestFetch()<{ cart: Cart }>(`/api/odoo/cart-load`),
    { immediate: false },
  )

  const loading = computed(() => status.value === 'pending')

  watch(data, (value: { cart?: Cart } | null) => applyCart(value))

  // `showError` lets post-order pages (thank-you / payment-fail) load the cart
  // quietly: after an order the draft cart no longer exists and Odoo returns
  // "Cart does not exist", which is expected there and shouldn't toast. The
  // error is surfaced here (rather than via a global watcher) so callers can
  // opt out of it.
  const loadCart = async (showError = true) => {
    await refreshCart()
    applyCart(data.value)
    if (error.value && showError) {
      toast.error((error.value as any)?.data?.message)
    }
  }

  const cartAdd = async (id: number, quantity: number) => {
    const params: MutationCartAddMultipleItemsArgs = {
      products: [{ id, quantity }],
    }

    try {
      loading.value = true
      cartError.value = ''

      const data = await $sdk().odoo.mutation<MutationCartAddMultipleItemsArgs, CartAddItemResponse>(
        { mutationName: MutationName.CartAddItem }, params,
      )

      cart.value = data.cartAddMultipleItems

      cartCounter.value = Number(cart.value?.order?.websiteOrderLine?.length)
      openCartSideBar()
    }
    catch (error: any) {
      cartError.value = error?.data?.message || error?.message || 'Could not add to cart. Please try again.'
    }
    finally {
      loading.value = false
    }
  }

  const updateItemQuantity = async (id: number, quantity: number) => {
    loading.value = true

    const params: MutationCartUpdateMultipleItemsArgs = {
      lines: [{ id, quantity }],
    }

    try {
      const data = await $sdk().odoo.mutation<MutationCartUpdateMultipleItemsArgs, CartUpdateItemResponse>(
        { mutationName: MutationName.CartUpdateQuantity }, params,
      )
      cart.value = data.cartUpdateMultipleItems
      cartCounter.value = Number(cart.value?.order?.websiteOrderLine?.length)
    }
    catch (error: any) {
      return toast.error(error.data.message)
    }
    finally {
      loading.value = false
    }
  }

  const removeItemFromCart = async (lineId: number) => {
    const params: MutationCartRemoveMultipleItemsArgs = {
      lineIds: [lineId],
    }

    loading.value = true

    try {
      const data = await $sdk().odoo.mutation<MutationCartRemoveMultipleItemsArgs, CartRemoveItemResponse>(
        { mutationName: MutationName.CartRemoveItem }, params,
      )

      cart.value = data.cartRemoveMultipleItems
      cartCounter.value = Number(cart.value?.order?.websiteOrderLine?.length)
    }
    catch (error: any) {
      return toast.error(error.data.message)
    }
    finally {
      loading.value = false
    }
  }

  const removeMultipleItemsFromCart = async (lineIds: number[]) => {
    const params: MutationCartRemoveMultipleItemsArgs = {
      lineIds,
    }

    loading.value = true

    try {
      const data = await $sdk().odoo.mutation<MutationCartRemoveMultipleItemsArgs, CartRemoveItemResponse>(
        { mutationName: MutationName.CartRemoveItem }, params,
      )

      cart.value = data.cartRemoveMultipleItems
      cartCounter.value = Number(cart.value?.order?.websiteOrderLine?.length)
    }
    catch (error: any) {
      return toast.error(error.data.message)
    }
    finally {
      loading.value = false
    }
  }

  const totalItemsInCart = computed(() => {
    return (
      cart.value.order?.websiteOrderLine?.reduce(
        (acc: any, item: { quantity: any }) => acc + (item.quantity ?? 0),
        0,
      ) || 0
    )
  })

  return {
    loadCart,
    cartAdd,
    updateItemQuantity,
    removeItemFromCart,
    removeMultipleItemsFromCart,
    frequentlyTogetherProducts,
    loading,
    cartError,
    cart,
    totalItemsInCart,
  }
}
