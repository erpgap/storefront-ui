import objectHash from 'object-hash'
import {
  AddressEnum,
  type AddressesResponse,
  type Partner,
  type QueryAddressesArgs,
  type AddAddressInput,
  type MutationAddAddressArgs,
  type UpdateAddressInput,
  type MutationUpdateAddressArgs,
  type AddAddressResponse,
  type responseAddresses,
} from '~~/graphql'
import { MutationName } from '~~/server/mutations'
import { QueryName } from '~~/server/queries'

export const useAddresses = () => {
  const { $sdk, $i18n } = useNuxtApp()
  const hash = objectHash('test')

  const loading = ref(false)
  // Why the last add or update failed, for the form that made it to show
  // next to its fields; '' when it went through.
  const error = ref('')
  const { user } = useAuth()

  const billingAddresses = useState<Partner[]>(
    `${hash}-billing-addresses`,
    () => [],
  )
  const shippingAddresses = useState<Partner[]>('shipping-addresses', () => [])

  const loadAddresses = async (addressType: AddressEnum) => {
    const params: QueryAddressesArgs = {
      filter: { addressType: [addressType] },
    }
    try {
      loading.value = true

      const { data } = await useAsyncData(
        `user-${user.value?.id}-addresses-${addressType}`,
        async () => {
          return await $sdk().odoo.query<QueryAddressesArgs, responseAddresses>(
            { queryName: QueryName.GetAddressesQuery },
            params,
          )
        },
      )

      if (!data.value?.addresses) return

      if (addressType === AddressEnum.Billing) {
        billingAddresses.value = data.value.addresses
        return
      }

      shippingAddresses.value = data.value.addresses
    }
    catch {
      // A refresh of the lists after a save: the save itself went through,
      // and the lists are loaded again on the next visit.
    }
    finally {
      loading.value = false
    }
  }

  // Resolves to the address Odoo created, or undefined when it failed.
  const addAddress = async (address: AddAddressInput, type: AddressEnum): Promise<Partner | undefined> => {
    try {
      loading.value = true
      error.value = ''
      const data = await $sdk().odoo.mutation<
        MutationAddAddressArgs,
        AddAddressResponse
      >(
        { mutationName: MutationName.AddAddress },
        { address, type },
      )

      await loadAddresses(type)
      return data?.addAddress
    }
    catch (e: any) {
      error.value = errorMessage(e, $i18n.t('core.genericError'))
    }
    finally {
      loading.value = false
    }
  }

  const updateAddress = async (
    address: UpdateAddressInput,
    type: AddressEnum,
  ) => {
    try {
      loading.value = true
      error.value = ''

      const data = await $sdk().odoo.mutation<
        MutationUpdateAddressArgs,
        { updateAddress: Partner }
      >({ mutationName: MutationName.UpdateAddress }, { address })

      if (type === AddressEnum.Billing) {
        const address = data?.updateAddress
        const index = billingAddresses.value.findIndex(
          (addr: { id: any }) => addr.id === address.id,
        )
        billingAddresses.value[index] = address
      }
      else {
        const address = data?.updateAddress
        const index = shippingAddresses.value.findIndex(
          (addr: { id: any }) => addr.id === address.id,
        )
        shippingAddresses.value[index] = address
      }
    }
    catch (e: any) {
      error.value = errorMessage(e, $i18n.t('core.genericError'))
    }
    finally {
      loading.value = false
    }
  }

  return {
    loadAddresses,
    billingAddresses,
    shippingAddresses,
    addAddress,
    updateAddress,
    error,
    loading,
  }
}
