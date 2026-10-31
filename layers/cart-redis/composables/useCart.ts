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
  const { $sdk, $i18n } = useNuxtApp()
  const cartCounter = useCookie<number>('cart-counter')
  const toast = useToast()
  // Taken here, while the composable runs in the component's setup: the
  // functions below run later, when Nuxt's context may be gone (during SSR
  // that threw NUXT_E1001 and lost the request's cookies).
  const requestFetch = useRequestFetch()
  const { openCartSideBar } = useCartUiState()
  const cart = useState<Cart>('cart', () => (({}) as Cart))
  const frequentlyTogetherProducts = useState<Product[]>('frequently-together-products', () => [])

  const cartError = ref('')

  const applyCart = (payload?: { cart?: Cart } | null) => {
    // No payload: the load failed, keep what we have.
    if (!payload)
      return
    // A payload without a cart: the session has none, e.g. once an order is
    // placed and its cart cleared. Keeping the old one left its items in the
    // header until the next full page load.
    if (!payload.cart) {
      cart.value = {} as Cart
      cartCounter.value = 0
      frequentlyTogetherProducts.value = []
      return
    }

    cart.value = payload.cart
    cartCounter.value = Number(payload.cart?.order?.websiteOrderLine?.length || 0)
    frequentlyTogetherProducts.value = (payload.cart.frequentlyBoughtTogether || []).filter((p): p is Product => p !== null)
  }

  const {
    data,
    status,
    error,
    refresh: refreshCart,
  } = useAsyncData<{ cart: Cart }>(
    'cart',
    () => requestFetch<{ cart: Cart }>(`/api/odoo/cart-load`),
    { immediate: false },
  )

  const loading = computed(() => status.value === 'pending')
  // While this instance is adding a line: `loading` only tracks loading the
  // cart, so it could not drive an "Adding…" state.
  const adding = ref(false)

  watch(data, value => applyCart(value))

  // `showError` lets post-order pages (thank-you / payment-fail) load the cart
  // quietly: after an order the draft cart no longer exists and Odoo returns
  // "Cart does not exist", which is expected there and shouldn't toast. The
  // error is surfaced here (rather than via a global watcher) so callers can
  // opt out of it.
  const loadCart = async (showError = true) => {
    await refreshCart()
    applyCart(data.value)
    if (error.value && showError) {
      toast.error(errorMessage(error.value, $i18n.t('core.genericError')))
    }
  }

  const cartAdd = async (id: number, quantity: number) => {
    const params: MutationCartAddMultipleItemsArgs = {
      products: [{ id, quantity }],
    }

    adding.value = true
    try {
      cartError.value = ''

      const data = await $sdk().odoo.mutation<MutationCartAddMultipleItemsArgs, CartAddItemResponse>(
        { mutationName: MutationName.CartAddItem }, params,
      )

      cart.value = data.cartAddMultipleItems

      cartCounter.value = Number(cart.value?.order?.websiteOrderLine?.length)
      openCartSideBar()
    }
    catch (error: any) {
      cartError.value = errorMessage(error, $i18n.t('shop.cart.addToCartError'))
    }
    finally {
      adding.value = false
    }
  }

  const updateItemQuantity = async (id: number, quantity: number) => {
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
      toast.error(errorMessage(error, $i18n.t('core.genericError')))
    }
  }

  const removeItemFromCart = async (lineId: number) => {
    const params: MutationCartRemoveMultipleItemsArgs = {
      lineIds: [lineId],
    }

    try {
      const data = await $sdk().odoo.mutation<MutationCartRemoveMultipleItemsArgs, CartRemoveItemResponse>(
        { mutationName: MutationName.CartRemoveItem }, params,
      )

      cart.value = data.cartRemoveMultipleItems
      cartCounter.value = Number(cart.value?.order?.websiteOrderLine?.length)
    }
    catch (error: any) {
      toast.error(errorMessage(error, $i18n.t('core.genericError')))
    }
  }

  const removeMultipleItemsFromCart = async (lineIds: number[]) => {
    const params: MutationCartRemoveMultipleItemsArgs = {
      lineIds,
    }

    try {
      const data = await $sdk().odoo.mutation<MutationCartRemoveMultipleItemsArgs, CartRemoveItemResponse>(
        { mutationName: MutationName.CartRemoveItem }, params,
      )

      cart.value = data.cartRemoveMultipleItems
      cartCounter.value = Number(cart.value?.order?.websiteOrderLine?.length)
    }
    catch (error: any) {
      toast.error(errorMessage(error, $i18n.t('core.genericError')))
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
    adding,
    cartError,
    cart,
    totalItemsInCart,
  }
}
