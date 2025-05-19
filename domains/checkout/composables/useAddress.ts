import { useToast } from 'vue-toastification'
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
  type SelectAddressInput,
  type MutationSelectAddressArgs,
  type SelectCurrentAddressResponse,
  type DeleteAddressInput,
  type MutationDeleteAddressArgs,
  type DeleteAddressResponse,
  type responseAddresses,
} from '~/graphql'
import { MutationName } from '~/server/mutations'
import { QueryName } from '~/server/queries'

export const useAddresses = () => {
  const { $sdk } = useNuxtApp()
  const hash = objectHash('test')

  const loading = ref(false)
  const toast = useToast()
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
          return await $sdk().odoo.query<
            QueryAddressesArgs,
            responseAddresses
          >(
            { queryName: QueryName.GetAddressesQuery }, params,
          )
        },
      )

      if (data.value?.addresses) {
        if (addressType === AddressEnum.Billing) {
          billingAddresses.value = data.value.addresses
        }
        else {
          shippingAddresses.value = data.value.addresses
        }
      }
    }
    catch (error: any) {
      if (error.value) {
        return toast.error(error.value.data.message)
      }
    }
    finally {
      loading.value = false
    }
  }

  const addAddress = async (address: AddAddressInput, type: AddressEnum) => {
    try {
      loading.value = true
      const { data } = await $sdk().odoo.mutation<
        MutationAddAddressArgs,
        AddAddressResponse
      >(
        { mutationName: MutationName.AddAddress },
        { address, type },
      )

      loadAddresses(type)
      toast.success('Address has been successfully saved')
    }
    catch (error: any) {
      if (error.value) {
        return toast.error(error.value.data.message)
      }
    }
    finally {
      loading.value = false
    }
  }

  const deleteAddress = async (address: DeleteAddressInput) => {
    loading.value = true

    const { data, error } = await $sdk().odoo.mutation<
      MutationDeleteAddressArgs,
      DeleteAddressResponse
    >({ mutationName: MutationName.DeleteAddress }, { address })

    /* if (error.value) {
      return toast.error(error.value.data.message)
    } */
    toast.success('Address has been successfully removed')
    loading.value = false
  }

  const updateAddress = async (
    address: UpdateAddressInput,
    type: AddressEnum,
  ) => {
    loading.value = true

    const { data, error } = await $sdk().odoo.mutation<
      MutationUpdateAddressArgs,
      SelectCurrentAddressResponse
    >({ mutationName: MutationName.UpdateAddress }, { address })

    if (error.value) {
      return toast.error(error.value.data.message)
    }

    if (type === AddressEnum.Billing) {
      const address = data.value.updateAddress
      const index = billingAddresses.value.findIndex(
        addr => addr.id === address.id,
      )
      billingAddresses.value[index] = address
    }
    else {
      const address = data.value.updateAddress
      const index = shippingAddresses.value.findIndex(
        addr => addr.id === address.id,
      )
      shippingAddresses.value[index] = address
    }

    toast.success('Address has been successfully updated')
    loading.value = false
  }

  const selectCurrentAddress = async (
    address: SelectAddressInput,
    type: AddressEnum,
  ) => {
    loading.value = true

    const { data, error } = await $sdk().odoo.mutation<
      MutationSelectAddressArgs,
      SelectCurrentAddressResponse
    >({ mutationName: MutationName.SelectCurrentAddress }, { address, type })

    if (error.value) {
      return toast.error(error.value.data.message)
    }

    loadAddresses(type)

    toast.success(`Current ${type} address saved successfully`)
    loading.value = false
  }

  return {
    loadAddresses,
    billingAddresses,
    shippingAddresses,
    selectCurrentAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    loading,
  }
}
