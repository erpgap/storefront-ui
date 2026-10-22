import { useToast } from 'vue-toastification'
import type {
  Order,
  Orders,
  QueryOrderArgs,
} from '~~/graphql'
import { QueryName } from '~~/server/queries'

export const useOrders = () => {
  const { $sdk } = useNuxtApp()
  const toast = useToast()
  const { redirectIfSessionExpired } = useAuth()
  const loading = ref(false)
  const orders = ref<Orders>()
  const order = ref<Order>()

  const getOrders = async () => {
    try {
      loading.value = true
      const data = await $sdk().odoo.query<null, { orders: Orders }>(
        { queryName: QueryName.GetOrdersQuery },
        null,
      )
      orders.value = (data?.orders as Orders) || {}
    }
    catch (error: any) {
      orders.value = {} as Orders
      if (await redirectIfSessionExpired()) return
      toast.error(error?.data?.message || error?.message)
    }
    finally {
      loading.value = false
    }
  }

  const getOrderById = async (params: QueryOrderArgs) => {
    try {
      loading.value = true
      const data = await $sdk().odoo.query<QueryOrderArgs, { order: Order }>(
        { queryName: QueryName.GetOrderQuery },
        params,
      )
      order.value = data?.order || ({} as Order)
    }
    catch (error: any) {
      order.value = {} as Order
      if (await redirectIfSessionExpired()) return
      toast.error(error?.data?.message || error?.message)
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    getOrders,
    getOrderById,
    orders,
    order,
  }
}
