import type {
  PaymentTransaction,
  PaymentProvider,
  AdyenPaymentMethodsResponse,
  AdyenTransactionResponse,
  AdyenProviderInfoResponse,
  MutationAdyenPaymentMethodsArgs,
  MutationAdyenPaymentDetailsArgs,
  MutationAdyenProviderInfoArgs,
  MutationAdyenTransactionArgs,
  AdyenPaymentDetailsResponse,
  Mutation,
  AdyenPaymentsResponse,
  MutationAdyenPaymentsArgs,
} from "~/graphql";
import { MutationName } from "~/server/mutations";

const useAdyenDirectPayment = (providerId: number, cartId?: number) => {
  const { $sdk } = useNuxtApp();

  const transaction = useState<PaymentTransaction>(
    `transaction-${cartId}`,
    () => ({} as PaymentTransaction)
  );
  const acquirerInfo = useState<PaymentProvider>(
    `acquirerInfo-${cartId}`,
    () => ({} as PaymentProvider)
  );
  const paymentMethods = useState<Mutation["adyenPaymentMethods"][]>(
    `paymentMethods-${cartId}`,
    () => []
  );
  const paymentDetails = useState<Mutation["adyenPaymentDetails"]>(
    `paymentDetails-${cartId}`,
    () => ({} as Mutation["adyenPaymentDetails"])
  );

  const openAdyenTransaction = async () => {
    const { data } = await $sdk().odoo.mutation<
      MutationAdyenTransactionArgs,
      AdyenTransactionResponse
    >(
      {
        mutationName: MutationName.AdyenTransaction,
      },
      { providerId }
    );

    transaction.value = data.value?.adyenTransaction?.transaction || {};
  };

  const getAdyenAcquirerInfo = async () => {
    const { data } = await useAsyncData("acquirer-info", async () => {
      const { data } = await $sdk().odoo.mutation<
        MutationAdyenProviderInfoArgs,
        AdyenProviderInfoResponse
      >(
        {
          mutationName: MutationName.AdyenProviderInfo,
        },
        { providerId }
      );

      return data.value;
    });

    acquirerInfo.value =
      data?.value?.adyenAcquirerInfo?.adyenAcquirerInfo || {};
  };

  const getAdyenPaymentMethods = async () => {
    const { data } = await useAsyncData("payment-methods", async () => {
      const { data } = await $sdk().odoo.mutation<
        MutationAdyenPaymentMethodsArgs,
        AdyenPaymentMethodsResponse
      >({ mutationName: MutationName.AdyenPaymentMethods }, { providerId });

      return data.value;
    });

    paymentMethods.value =
      data?.value?.adyenPaymentMethods?.adyenPaymentMethods || [];
  };

  const getAdyenPaymentDetails = async (
    params: MutationAdyenPaymentDetailsArgs
  ) => {
    const { data } = await $sdk().odoo.mutation<
      MutationAdyenPaymentDetailsArgs,
      AdyenPaymentDetailsResponse
    >({ mutationName: MutationName.AdyenPaymentDetails }, { ...params });

    paymentDetails.value =
      data?.value?.adyenPaymentDetails?.adyenPaymentDetails || {};
  };

  const adyenMakeDirectPayment = async (params: MutationAdyenPaymentsArgs) => {
    const { data } = await useAsyncData("make-direct-payment", async () => {
      const { data } = await $sdk().odoo.mutation<
        MutationAdyenPaymentsArgs,
        AdyenPaymentsResponse
      >(
        {
          mutationName: MutationName.AdyenPayments,
        },
        { ...params }
      );

      return data.value;
    });

    return data?.value?.adyenPayments?.adyenPayments || {};
  };

  const setTransaction = (transactionParam: PaymentTransaction) =>
    (transaction.value = transactionParam);

  return {
    getAdyenPaymentMethods,
    paymentMethods,
    transaction,
    acquirerInfo,
    openAdyenTransaction,
    adyenMakeDirectPayment,
    getAdyenAcquirerInfo,
    getAdyenPaymentDetails,
    setTransaction,
  };
};

export default useAdyenDirectPayment;
