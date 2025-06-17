import { useToast } from 'vue-toastification'
import type {
  ShippingMethod,
  DeliveryMethodListResponse,
  MutationSetShippingMethodArgs,
  DeliveryMethodResponse,
} from '~/graphql'
import { MutationName } from '~/server/mutations'
import { QueryName } from '~/server/queries'

export const useDeliveryMethod = () => {
  const { $sdk } = useNuxtApp()

  const loading = ref(false)
  const toast = useToast()
  const deliveryMethods = useState<ShippingMethod[]>(
    'delivery-method',
    () => [],
  )

  const loadDeliveryMethods = async () => {
    loading.value = true
    try {
      const { data } = await useAsyncData('shipping-methods', async () =>
        await $sdk().odoo.query<
          any,
          DeliveryMethodListResponse
        >({
          queryName: QueryName.GetDeliveryMethodsQuery,
        }),
      )

      deliveryMethods.value = data.value?.deliveryMethods || []
    }
    catch (error: any) {
      toast.error(error?.data?.message)
    }
    finally {
      loading.value = false
    }
  }

  const setDeliveryMethod = async (shippingMethodId: number) => {
    try {
      loading.value = true
      await $sdk().odoo.mutation<
        MutationSetShippingMethodArgs,
        DeliveryMethodResponse
      >({ mutationName: MutationName.ShippingMethod }, { shippingMethodId })
    }
    catch (error: any) {
      toast.error(error?.data?.message)
    }
    finally {
      loading.value = false
    }
  }

  return {
    loadDeliveryMethods,
    setDeliveryMethod,
    deliveryMethods,
    loading,
  }
}
