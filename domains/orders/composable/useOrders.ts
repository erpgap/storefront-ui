import type {
  GetOrderResponse,
  GetOrdersResponse,
  Order,
  Orders,
  QueryOrderArgs,
} from "~/graphql";
import { QueryName } from "~/server/queries";

export const useOrders = () => {
  const { $sdk } = useNuxtApp();
  const loading = ref(false);
  const orders = ref<Orders>();
  const order = ref<Order>();

  const getOrders = async () => {
    loading.value = true;
    const { data } = await $sdk().odoo.query<null, GetOrdersResponse>(
      { queryName: QueryName.GetOrdersQuery },
      null
    );
    loading.value = false;
    orders.value = (data.value?.orders as Orders) || {};
  };

  const getOrderById = async (params: QueryOrderArgs) => {
    loading.value = true;
    const { data } = await $sdk().odoo.query<QueryOrderArgs, GetOrderResponse>(
      { queryName: QueryName.GetOrderQuery },
      params
    );
    loading.value = false;
    order.value = data?.value?.order || ({} as Order);
  };

  return {
    loading,
    getOrders,
    getOrderById,
    orders,
    order,
  };
};
