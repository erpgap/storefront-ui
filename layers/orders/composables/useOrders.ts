import type {
  Order,
  Orders,
  QueryOrderArgs,
} from '~~/graphql'
import { QueryName } from '~~/server/queries'

export const useOrders = () => {
  const { $sdk, $i18n } = useNuxtApp()
  const { redirectIfSessionExpired } = useAuth()
  const loading = ref(false)
  // Why the orders (or the order) could not be loaded: the page shows it in
  // place of the list, not as "no orders yet".
  const error = ref('')
  const orders = ref<Orders>()
  const order = ref<Order>()

  const getOrders = async () => {
    try {
      loading.value = true
      error.value = ''
      const data = await $sdk().odoo.query<null, { orders: Orders }>(
        { queryName: QueryName.GetOrdersQuery },
        null,
      )
      orders.value = (data?.orders as Orders) || {}
    }
    catch (e: any) {
      orders.value = {} as Orders
      if (await redirectIfSessionExpired()) return
      error.value = errorMessage(e, $i18n.t('core.genericError'))
    }
    finally {
      loading.value = false
    }
  }

  const getOrderById = async (params: QueryOrderArgs) => {
    try {
      loading.value = true
      error.value = ''
      const data = await $sdk().odoo.query<QueryOrderArgs, { order: Order }>(
        { queryName: QueryName.GetOrderQuery },
        params,
      )
      order.value = data?.order || ({} as Order)
    }
    catch (e: any) {
      order.value = {} as Order
      if (await redirectIfSessionExpired()) return
      error.value = errorMessage(e, $i18n.t('core.genericError'))
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getOrders,
    getOrderById,
    orders,
    order,
  }
}
