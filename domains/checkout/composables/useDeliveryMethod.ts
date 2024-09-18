import { useToast } from "vue-toastification";
import type {
  ShippingMethod,
  DeliveryMethodListResponse,
  MutationSetShippingMethodArgs,
  DeliveryMethodResponse,
} from "~/graphql";
import { MutationName } from "~/server/mutations";
import { QueryName } from "~/server/queries";

export const useDeliveryMethod = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const toast = useToast();
  const deliveryMethods = useState<ShippingMethod[]>(
    "delivery-method",
    () => []
  );

  const loadDeliveryMethods = async () => {
    loading.value = true;
    try {
      const { data } = await useAsyncData("shipping-methods", async () => {
        const { data } = await $sdk().odoo.query<
          any,
          DeliveryMethodListResponse
        >({
          queryName: QueryName.GetDeliveryMethodsQuery,
        });
        return data.value;
      });

      if (data.value) {
        deliveryMethods.value = data.value.deliveryMethods || [];
      }
    } finally {
      loading.value = false;
    }
  };

  const setDeliveryMethod = async (shippingMethodId: number) => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.mutation<
      MutationSetShippingMethodArgs,
      DeliveryMethodResponse
    >({ mutationName: MutationName.ShippingMethod }, { shippingMethodId });

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    //toast.success("Address has been successfully saved");
    loading.value = false;

    // deliveryMethods.value = [method];
  };

  return {
    loadDeliveryMethods,
    setDeliveryMethod,
    deliveryMethods,
    loading,
  };
};
