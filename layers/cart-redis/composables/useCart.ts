import { useToast } from 'vue-toastification'
import type {
  Cart,
  CartAddItemResponse,
  CartRemoveItemResponse,
  CartResponse,
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

  const loading = ref(false)
  // Inline add-to-cart error, shown near the button (cleared on each attempt).
  const cartError = ref('')

  const loadCart = async () => {
    try {
      loading.value = true
      // Use a direct fetch (not cached useFetch) so every call returns the
      // current cart — useFetch would return a stale cached payload on
      // client-side navigation. useRequestFetch forwards the session cookie
      // on SSR so the cart still resolves on reload.
      const data = await useRequestFetch()<{ cart: Cart }>(`/api/odoo/cart-load`)

      if (!data?.cart)
        return

      cart.value = data.cart
      cartCounter.value = Number(data.cart?.order?.websiteOrderLine?.length || 0)
      frequentlyTogetherProducts.value = (data.cart.frequentlyBoughtTogether || []).filter((p: null): p is Product => p !== null)
    }
    catch (error: any) {
      return toast.error(error.data?.message)
    }
    finally {
      loading.value = false
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
