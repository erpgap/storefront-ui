import { useToast } from 'vue-toastification';
import { debounce } from 'lodash-es';
import type {
  ShippingMethod,
  DeliveryMethodListResponse,
  MutationSetShippingMethodArgs,
  DeliveryMethodResponse,
} from '~~/graphql';
import { MutationName } from '~~/server/mutations';
import { QueryName } from '~~/server/queries';
import { useCheckout } from './useCheckout';

export const useDeliveryMethod = () => {
  const { $sdk } = useNuxtApp();
  const { loading, setLoading } = useCheckout();
  const toast = useToast();
  const { loadCart } = useCart();
  const deliveryMethods = useState<ShippingMethod[]>(
    'delivery-method',
    () => [],
  );

  const loadDeliveryMethods = async () => {
    try {
      setLoading(true);
      // Always fetch fresh: the available delivery methods depend on the order's
      // shipping address, which is set partway through checkout. A cached
      // (useAsyncData) result would keep returning the empty "no address yet"
      // list even after the address has been filled in.
      const data = await $sdk().odoo.queryNoCache<
        any,
        DeliveryMethodListResponse
      >({
        queryName: QueryName.GetDeliveryMethodsQuery,
      });

      deliveryMethods.value = data?.deliveryMethods || [];
    } catch (error: any) {
      toast.error(error?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const _setDeliveryMethod = async (shippingMethodId: number) => {
    try {
      setLoading(true);
      await $sdk().odoo.mutation<
        MutationSetShippingMethodArgs,
        DeliveryMethodResponse
      >({ mutationName: MutationName.ShippingMethod }, { shippingMethodId });
      await loadCart();
    } catch (error: any) {
      toast.error(error?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  const setDeliveryMethod = debounce(_setDeliveryMethod, 500);

  return {
    loadDeliveryMethods,
    setDeliveryMethod,
    setDeliveryMethodImmediate: _setDeliveryMethod,
    deliveryMethods,
    loading,
  };
};
