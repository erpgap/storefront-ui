import { ShippingMethod, DeliveryMethodListResponse } from '~/graphql';
import { QueryName } from '~/server/queries';

export const useDeliveryMethod = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const deliveryMethods = useState<ShippingMethod[]>('delivery-method', () => []);

  const loadDeliveryMethods = async () => {
    loading.value = true;
    try {
      const { data } = await useAsyncData('shipping-methods', async () => {
        const { data } = await $sdk().odoo.query<any, DeliveryMethodListResponse>({
          queryName: QueryName.GetDeliveryMethods,
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

  return {
    loadDeliveryMethods,
    deliveryMethods,
    loading,
  };
};
