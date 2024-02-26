import { PaymentAcquirer, PaymentMethodListResponse } from '~/graphql';
import { QueryName } from '~/server/queries';

export const usePaymentMethod = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const paymentMethods = useState<PaymentAcquirer[]>('payment-method', () => []);

  const loadPaymentMethods = async () => {
    loading.value = true;
    try {
      const { data } = await useAsyncData('payment-methods', async () => {
        const { data } = await $sdk().odoo.query<any, PaymentMethodListResponse>({
          queryName: QueryName.GetPaymentMethods,
        });
        return data.value;
      });

      if (data.value) {
        paymentMethods.value = data.value.paymentAcquirers || [];
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    loadPaymentMethods,
    paymentMethods,
    loading,
  };
};
