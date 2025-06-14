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
} from '~/graphql'
import { MutationName } from '~/server/mutations'

const useAdyenDirectPayment = (providerId: number, cartId?: number) => {
  const { $sdk } = useNuxtApp()

  const transaction = useState<PaymentTransaction>(
    `transaction-${cartId}`,
    () => ({}) as PaymentTransaction,
  )
  const acquirerInfo = useState<PaymentProvider>(
    `acquirerInfo-${cartId}`,
    () => ({}) as PaymentProvider,
  )
  const paymentMethods = useState<Mutation['adyenPaymentMethods'][]>(
    `paymentMethods-${cartId}`,
    () => [],
  )
  const paymentDetails = useState<Mutation['adyenPaymentDetails']>(
    `paymentDetails-${cartId}`,
    () => ({}) as Mutation['adyenPaymentDetails'],
  )

  const openAdyenTransaction = async () => {
    const data: AdyenTransactionResponse | any = await $sdk().odoo.mutation<
      MutationAdyenTransactionArgs,
      AdyenTransactionResponse
    >(
      {
        mutationName: MutationName.AdyenTransaction,
      },
      { providerId },
    )

    transaction.value = data?.adyenTransaction?.transaction || {}
  }

  const getAdyenAcquirerInfo = async () => {
    const data: AdyenProviderInfoResponse | any = await $sdk().odoo.mutation<
      MutationAdyenProviderInfoArgs,
      AdyenProviderInfoResponse
    >(
      {
        mutationName: MutationName.AdyenProviderInfo,
      },
      { providerId },
    )

    acquirerInfo.value
      = data?.adyenProviderInfo?.adyenProviderInfo || {}
  }

  const getAdyenPaymentMethods = async () => {
    const { data } = await useAsyncData<AdyenPaymentMethodsResponse | any>('payment-methods', async () =>
      await $sdk().odoo.mutation<
        MutationAdyenPaymentMethodsArgs,
        AdyenPaymentMethodsResponse
      >({ mutationName: MutationName.AdyenPaymentMethods }, { providerId }))

    paymentMethods.value
      = data?.value?.adyenPaymentMethods?.adyenPaymentMethods || []
  }

  const getAdyenPaymentDetails = async (
    params: MutationAdyenPaymentDetailsArgs,
  ) => {
    const data: AdyenPaymentDetailsResponse | any = await $sdk().odoo.mutation<
      MutationAdyenPaymentDetailsArgs,
      AdyenPaymentDetailsResponse
    >({ mutationName: MutationName.AdyenPaymentDetails }, { ...params })

    paymentDetails.value
      = data?.adyenPaymentDetails?.adyenPaymentDetails || {}
  }

  const adyenMakeDirectPayment = async (params: MutationAdyenPaymentsArgs) => {
    const { data } = await useAsyncData<AdyenPaymentsResponse | any>('make-direct-payment', async () =>
      await $sdk().odoo.mutation<
        MutationAdyenPaymentsArgs,
        AdyenPaymentsResponse
      >(
        {
          mutationName: MutationName.AdyenPayments,
        },
        { ...params },
      ),
    )

    return data?.value?.adyenPayments?.adyenPayments || {}
  }

  const setTransaction = (transactionParam: PaymentTransaction) =>
    (transaction.value = transactionParam)

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
  }
}

export default useAdyenDirectPayment
