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
} from '~/graphql'
import { MutationName } from '~/server/mutations'
import { QueryName } from '~/server/queries'

export const useCart = () => {
  const { $sdk } = useNuxtApp()
  const cartCounter = useCookie<number>('cart-counter')
  const toast = useToast()
  const cart = useState<Cart>('cart', () => ({}) as Cart)

  const loading = ref(false)

  const loadCart = async () => {
    loading.value = true
    const { data } = await useFetch<{ cart: Cart }>(`/api/odoo/cart-load`)
    loading.value = false

    cart.value = data.value?.cart
    cartCounter.value = Number(data.value?.cart.order?.websiteOrderLine?.length)
  }

  const cartAdd = async (id: number, quantity: number) => {
    const params: MutationCartAddMultipleItemsArgs = {
      products: [{ id, quantity }],
    }

    try {
      loading.value = true

      const data = await $sdk().odoo.mutation<MutationCartAddMultipleItemsArgs, CartAddItemResponse>(
        { mutationName: MutationName.CartAddItem }, params,
      )

      cart.value = data.cartAddMultipleItems

      cartCounter.value = Number(cart.value?.order?.websiteOrderLine?.length)
      toast.success('Product has been added to cart')
    }
    catch (error: any) {
      return toast.error(error.data.message)
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
      toast.success('Product updated successfully')
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
      toast.success('Product removed successfully')
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
      cart.value?.order?.websiteOrderLine?.reduce(
        (acc, item) => acc + item.quantity,
        0,
      ) || 0
    )
  })

  return {
    loadCart,
    cartAdd,
    updateItemQuantity,
    removeItemFromCart,

    loading,
    cart,
    totalItemsInCart,
  }
}
