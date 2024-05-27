import type { GetOrdersResponse, Orders } from "~/graphql";
import { QueryName } from "~/server/queries";

export const useOrders = () => {
  const { $sdk } = useNuxtApp();
  const loading = ref(false);
  const orders = ref<Orders>();

  const getOrders = async () => {
    loading.value = true;
    const { data } = await $sdk().odoo.query<null, GetOrdersResponse>(
      { queryName: QueryName.GetOrdersQuery },
      null
    );
    loading.value = false;
    orders.value = (data.value?.orders as Orders) || {};
  };

  return {
    loading,
    getOrders,
    orders,
  };
};
