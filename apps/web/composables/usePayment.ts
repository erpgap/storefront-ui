import { PaymentAcquirer, PaymentMethodListResponse } from '~/graphql';
import { QueryName } from '~/server/queries';

export const usePayment = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const paymentMethods = useState<PaymentAcquirer[]>('payment-method', () => []);

  const loadPaymentMethods = async () => {
    loading.value = true;
    try {
      const { data } = await useAsyncData('payment-methods', async () => {
        const { data } = await $sdk().odoo.query<any, PaymentMethodListResponse>({
          queryName: QueryName.GetPaymentMethodsQuery,
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

  const getPaymentConfirmation = async () => {
    loading.value = true;
    const { data } = await useAsyncData('payment-confirmation', async () => {
      const { data } = await $sdk().odoo.query<any, any>(
        {
          queryName: QueryName.GetPaymentConfirmation,
        }
      );
      return data.value;
    });

    if (data.value) {
      return data.value;
    }
    loading.value = false;
  };

  return {
    loadPaymentMethods,
    paymentMethods,
    getPaymentConfirmation,
    loading,
  };
};
