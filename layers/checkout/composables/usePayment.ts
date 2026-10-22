import { useNuxtApp, useState } from 'nuxt/app'
import { useToast } from 'vue-toastification'
import type { PaymentProvider } from '~~/graphql'
import { QueryName } from '~~/server/queries'

export const usePayment = () => {
  const { $sdk } = useNuxtApp()
  const toast = useToast()

  const loading = ref(false)
  const paymentProviders = useState<PaymentProvider[]>(
    'payment-providers',
    () => [],
  )
  const selectedProvider = useState<PaymentProvider | null>(
    'selected-payment-provider',
    () => null,
  )

  const updateSelectedProvider = (provider: PaymentProvider) => {
    selectedProvider.value = provider
  }

  // Called from CheckoutPayment's onMounted, where useAsyncData does not
  // belong (NUXT_E3003): plain call.
  const loadPaymentMethods = async () => {
    try {
      loading.value = true
      const data = await $sdk().odoo.query<any, { paymentProviders: PaymentProvider[] }>({
        queryName: QueryName.GetPaymentMethodsQuery,
      })

      paymentProviders.value = data?.paymentProviders || []
    }
    catch (error: any) {
      toast.error(error?.data?.message)
    }
    finally {
      loading.value = false
    }
  }

  // `showError` lets callers probe the confirmation silently (e.g. the
  // thank-you page, which redirects home when there's no order rather than
  // surfacing a toast).
  const getPaymentConfirmation = async (showError = true) => {
    try {
      loading.value = true
      const data = await $sdk().odoo.query<any, any>({
        queryName: QueryName.GetPaymentConfirmation,
      })

      return data?.paymentConfirmation
    }
    catch (error: any) {
      if (showError) toast.error(error?.data?.message)
    }
    finally {
      loading.value = false
    }
  }

  return {
    loadPaymentMethods,
    paymentProviders,
    getPaymentConfirmation,
    loading,
    selectedProvider,
    updateSelectedProvider,
  }
}
