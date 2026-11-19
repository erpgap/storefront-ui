import { useNuxtApp, useState } from 'nuxt/app'
import type { PaymentProvider } from '~~/graphql'
import { QueryName } from '~~/server/queries'

/**
 * Odoo provider codes CheckoutPayment has a payment form for. Its component
 * map is typed by this list, so adding a provider here without a form fails
 * the type check.
 */
export const SUPPORTED_PAYMENT_PROVIDERS = ['stripe', 'adyen'] as const

export const usePayment = () => {
  const { $sdk } = useNuxtApp()

  const loading = ref(false)
  // Loading the payment methods failed: the payment section says so and
  // offers to try again, rather than "no method available".
  const loadFailed = ref(false)
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
      loadFailed.value = false
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
    catch {
      loadFailed.value = true
    }
    finally {
      loading.value = false
    }
  }

  // Undefined when Odoo cannot say: the payment form then shows the failure
  // page, and the thank-you page sends the shopper home.
  const getPaymentConfirmation = async () => {
    try {
      loading.value = true
      const data = await $sdk().odoo.query<any, any>({
        queryName: QueryName.GetPaymentConfirmation,
      })

      return data?.paymentConfirmation
    }
    catch {
      return undefined
    }
    finally {
      loading.value = false
    }
  }

  return {
    loadPaymentMethods,
    loadFailed,
    paymentProviders,
    getPaymentConfirmation,
    loading,
    selectedProvider,
    updateSelectedProvider,
  }
}
