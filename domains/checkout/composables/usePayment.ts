import type { PaymentProvider, PaymentMethodListResponse } from "~/graphql";
import { QueryName } from "~/server/queries";

export const usePayment = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const paymentProviders = useState<PaymentProvider[]>(
    "payment-providers",
    () => []
  );

  const loadPaymentMethods = async () => {
    loading.value = true;
    const { data } = await $sdk().odoo.query<any, PaymentMethodListResponse>({
      queryName: QueryName.GetPaymentMethodsQuery,
    });

    if (data.value) {
      paymentProviders.value = data.value.paymentProviders || [];
    }
    loading.value = false;
  };

  const getPaymentConfirmation = async () => {
    loading.value = true;
    const { data } = await $sdk().odoo.query<any, any>({
      queryName: QueryName.GetPaymentConfirmation,
    });

    if (data.value) {
      return data.value?.paymentConfirmation;
    }
    loading.value = false;
  };

  return {
    loadPaymentMethods,
    paymentProviders,
    getPaymentConfirmation,
    loading,
  };
};
