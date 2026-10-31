import { useNuxtApp, useState } from 'nuxt/app'
import { useToast } from 'vue-toastification'
import type { PaymentProvider } from '~~/graphql'
import { QueryName } from '~~/server/queries'

/**
 * Odoo provider codes CheckoutPayment has a payment form for. Its component
 * map is typed by this list, so adding a provider here without a form fails
 * the type check.
 */
export const SUPPORTED_PAYMENT_PROVIDERS = ['stripe', 'adyen'] as const

export const usePayment = () => {
  const { $sdk, $i18n } = useNuxtApp()
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

      // Only the providers checkout has a payment form for. Odoo can offer
      // others (wire transfer, cash on delivery...), and one of those showed
      // up as a choice with nothing under it and a Place order button that did
      // nothing. With none left, the payment step says no method is available.
      paymentProviders.value = (data?.paymentProviders || [])
        .filter(provider => (SUPPORTED_PAYMENT_PROVIDERS as readonly string[]).includes(provider.code ?? ''))
    }
    catch (error: any) {
      toast.error(errorMessage(error, $i18n.t('core.genericError')))
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
      if (showError) toast.error(errorMessage(error, $i18n.t('core.genericError')))
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
