import {
  PaymentTransaction,
  PaymentAcquirer,
  AdyenPaymentMethodsResponse,
  AdyenTransactionResponse,
  AdyenAcquirerInfoResponse,
  MutationAdyenPaymentMethodsArgs,
  MutationAdyenPaymentDetailsArgs,
  MutationAdyenAcquirerInfoArgs,
  MutationAdyenTransactionArgs,
  AdyenPaymentDetailsResponse,
  Mutation,
  AdyenPaymentsResponse,
  MutationAdyenPaymentsArgs,
} from '~/graphql';
import { MutationName } from '~/server/mutations';

export interface IUseAdyenDropInPayment {
  transaction: Ref<any>;
  acquirerInfo: Ref<any>;
  paymentMethods: Ref<any>;
  openAdyenTransaction: () => any;
  getAdyenAcquirerInfo: () => any;
  getAdyenPaymentMethods: () => any;
  getAdyenPaymentDetails: (params: MutationAdyenPaymentDetailsArgs) => any;
  adyenMakeDirectPayment: (params: MutationAdyenPaymentsArgs) => any;
  setTransaction: (transaction: PaymentTransaction) => any;
}

const useAdyenDirectPayment = (acquirerId: number, cartId?: number): IUseAdyenDropInPayment => {
  const { $sdk } = useNuxtApp();

  const transaction = useState<PaymentTransaction>(`transaction-${cartId}`, () => ({}) as PaymentTransaction);
  const acquirerInfo = useState<PaymentAcquirer>(`acquirerInfo-${cartId}`, () => ({}) as PaymentAcquirer);
  const paymentMethods = useState<Mutation['adyenPaymentMethods'][]>(`paymentMethods-${cartId}`, () => []);
  const paymentDetails = useState<Mutation['adyenPaymentDetails']>(
    `paymentDetails-${cartId}`,
    () => ({}) as Mutation['adyenPaymentDetails'],
  );

  const openAdyenTransaction = async () => {
    const { data } = await useAsyncData('payment-transaction', async () => {
      const { data } = await $sdk().odoo.mutation<MutationAdyenTransactionArgs, AdyenTransactionResponse>(
        {
          mutationName: MutationName.AdyenTransaction,
        },
        { acquirerId },
      );

      return data.value;
    });

    transaction.value = data.value?.adyenTransaction?.transaction || {};
  };

  const getAdyenAcquirerInfo = async () => {
    const { data } = await useAsyncData('acquirer-info', async () => {
      const { data } = await $sdk().odoo.mutation<MutationAdyenAcquirerInfoArgs, AdyenAcquirerInfoResponse>(
        {
          mutationName: MutationName.AdyenAcquierInfo,
        },
        { acquirerId },
      );

      return data.value;
    });

    acquirerInfo.value = data?.value?.adyenAcquirerInfo?.adyenAcquirerInfo || {};
  };

  const getAdyenPaymentMethods = async () => {
    const { data } = await useAsyncData('payment-methods', async () => {
      const { data } = await $sdk().odoo.mutation<MutationAdyenPaymentMethodsArgs, AdyenPaymentMethodsResponse>(
        { mutationName: MutationName.AdyenPaymentMethods },
        { acquirerId },
      );

      return data.value;
    });

    paymentMethods.value = data?.value?.adyenPaymentMethods?.adyenPaymentMethods || [];
  };

  const getAdyenPaymentDetails = async (params: MutationAdyenPaymentDetailsArgs) => {
    const { data } = await useAsyncData('payment-details', async () => {
      const { data } = await $sdk().odoo.mutation<MutationAdyenPaymentDetailsArgs, AdyenPaymentDetailsResponse>(
        {
          mutationName: MutationName.AdyenPaymentDetails,
        },
        { ...params },
      );

      return data.value;
    });

    paymentDetails.value = data?.value?.adyenPaymentDetails?.adyenPaymentDetails || {};
  };

  const adyenMakeDirectPayment = async (params: MutationAdyenPaymentsArgs) => {
    const { data } = await useAsyncData('make-direct-payment', async () => {
      const { data } = await $sdk().odoo.mutation<MutationAdyenPaymentsArgs, AdyenPaymentsResponse>(
        {
          mutationName: MutationName.AdyenPayments,
        },
        { ...params },
      );

      return data.value;
    });

    return data?.value?.adyenPayments?.adyenPayments || {};
  };

  const setTransaction = (transactionParam: PaymentTransaction) => (transaction.value = transactionParam);

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
