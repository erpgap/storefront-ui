import { useToast } from 'vue-toastification'
import type { PaymentProvider, PaymentMethodListResponse } from '~/graphql'
import { QueryName } from '~/server/queries'

export const usePayment = () => {
  const { $sdk } = useNuxtApp()
  const toast = useToast()

  const loading = ref(false)
  const paymentProviders = useState<PaymentProvider[]>(
    'payment-providers',
    () => [],
  )

  const loadPaymentMethods = async () => {
    try {
      loading.value = true
      const { data } = await useAsyncData('payment-providers', async () => await $sdk().odoo.query<any, PaymentMethodListResponse>({
        queryName: QueryName.GetPaymentMethodsQuery,
      }))

      paymentProviders.value = data.value?.paymentProviders || []
    }
    catch (error: any) {
      toast.error(error?.data?.message)
    }
    finally {
      loading.value = false
    }
  }

  const getPaymentConfirmation = async () => {
    try {
      loading.value = true
      const data = await $sdk().odoo.query<any, any>({
        queryName: QueryName.GetPaymentConfirmation,
      })

      return data?.paymentConfirmation
    }
    catch (error: any) {
      toast.error(error?.data?.message)
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
  }
}
