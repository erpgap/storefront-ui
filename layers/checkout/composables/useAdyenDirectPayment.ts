import type { PaymentMethodsResponse } from '@adyen/adyen-web'
import type {
  AdyenTransactionResult,
  AdyenProviderInfoResult,
  MutationAdyenPaymentMethodsArgs,
  MutationAdyenPaymentDetailsArgs,
  MutationAdyenProviderInfoArgs,
  MutationAdyenTransactionArgs,
  AdyenPaymentMethodsResult,
  AdyenPaymentDetailsResult,
  AdyenPaymentsResult,
  MutationAdyenPaymentsArgs,
} from '~~/graphql'
import { MutationName } from '~~/server/mutations'

/**
 * Adyen's `/paymentMethods` response, as the drop-in takes it, plus the
 * `country_code` Odoo adds: the shopper's country it asked Adyen for.
 */
export type AdyenPaymentMethods = PaymentMethodsResponse & { country_code?: string }

/** What `adyenProviderInfo` returns (payment_adyen_alokai). */
export interface AdyenProviderInfo {
  state?: string
  client_key?: string | false
}

/**
 * What `adyenTransaction` returns: Odoo's processing values for the new
 * transaction (`_get_processing_values`, plus Adyen's `access_token`).
 */
export interface AdyenTransaction {
  reference: string
  access_token: string
  [key: string]: unknown
}

const useAdyenDirectPayment = (providerId: number, cartId?: number) => {
  const { $sdk } = useNuxtApp()

  const transaction = useState<AdyenTransaction>(
    `transaction-${cartId}`,
    () => ({}) as AdyenTransaction,
  )
  const acquirerInfo = useState<AdyenProviderInfo>(
    `acquirerInfo-${cartId}`,
    () => ({}),
  )
  // `[]` until loaded, which the drop-in setup treats as "no methods".
  const paymentMethods = useState<AdyenPaymentMethods | never[]>(
    `paymentMethods-${cartId}`,
    () => [],
  )
  const paymentDetails = useState<AdyenPaymentDetailsResult['adyenPaymentDetails']>(
    `paymentDetails-${cartId}`,
    () => ({}) as AdyenPaymentDetailsResult['adyenPaymentDetails'],
  )

  const openAdyenTransaction = async () => {
    const data = await $sdk().odoo.mutation<
      MutationAdyenTransactionArgs,
      { adyenTransaction: AdyenTransactionResult }
    >(
      {
        mutationName: MutationName.AdyenTransaction,
      },
      { providerId },
    )

    transaction.value = data?.adyenTransaction?.transaction || {}
  }

  const getAdyenAcquirerInfo = async () => {
    const data = await $sdk().odoo.mutation<
      MutationAdyenProviderInfoArgs,
      { adyenProviderInfo: AdyenProviderInfoResult }
    >(
      {
        mutationName: MutationName.AdyenProviderInfo,
      },
      { providerId },
    )
    acquirerInfo.value
      = data?.adyenProviderInfo?.adyenProviderInfo || {}
  }

  // Called from the drop-in's onMounted, where useAsyncData does not belong
  // (NUXT_E3003): plain call.
  const getAdyenPaymentMethods = async () => {
    const data = await $sdk().odoo.mutation<
      MutationAdyenPaymentMethodsArgs,
      { adyenPaymentMethods: AdyenPaymentMethodsResult }
    >({ mutationName: MutationName.AdyenPaymentMethods }, { providerId })
    paymentMethods.value = data?.adyenPaymentMethods?.adyenPaymentMethods || []
  }

  const getAdyenPaymentDetails = async (
    params: MutationAdyenPaymentDetailsArgs,
  ) => {
    const data = await $sdk().odoo.mutation<
      MutationAdyenPaymentDetailsArgs,
      { adyenPaymentDetails: AdyenPaymentDetailsResult }
    >({ mutationName: MutationName.AdyenPaymentDetails }, { ...params })

    paymentDetails.value
      = data?.adyenPaymentDetails?.adyenPaymentDetails || {}
    return paymentDetails.value
  }

  // Called from the drop-in's onSubmit, after the component is mounted, where
  // useAsyncData does not belong (Nuxt warns, and it adds nothing to a one-off
  // mutation): plain call.
  const adyenMakeDirectPayment = async (params: MutationAdyenPaymentsArgs) => {
    const data = await $sdk().odoo.mutation<
      MutationAdyenPaymentsArgs,
      { adyenPayments: AdyenPaymentsResult }
    >({ mutationName: MutationName.AdyenPayments }, { ...params })

    return data?.adyenPayments?.adyenPayments || {}
  }

  const setTransaction = (transactionParam: AdyenTransaction) =>
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
