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
      loading.value = true;

      const { data } = await useAsyncData(
        `user-${user.value?.id}-addresses-${addressType}`,
        async () => {
          return await $sdk().odoo.query<QueryAddressesArgs, responseAddresses>(
            { queryName: QueryName.GetAddressesQuery },
            params
          );
        }
      );

      if (!data.value?.addresses) return;
      
      if (addressType === AddressEnum.Billing) {
        billingAddresses.value = data.value.addresses;
        return;
      }

      shippingAddresses.value = data.value.addresses;
    }
    catch (error: any) {
      toast.error(error?.data?.message)
    }
    finally {
      loading.value = false
    }
  }

  const addAddress = async (address: AddAddressInput, type: AddressEnum) => {
    try {
      loading.value = true
       await $sdk().odoo.mutation<
        MutationAddAddressArgs,
        AddAddressResponse
      >(
        { mutationName: MutationName.AddAddress },
        { address, type },
      )

      await loadAddresses(type)
      toast.success('Address has been successfully saved')
    }
    catch (error: any) {
      toast.error(error?.data?.message)
    }
    finally {
      loading.value = false
    }
  }

  const deleteAddress = async (address: DeleteAddressInput) => {
    try {
    loading.value = true
     await $sdk().odoo.mutation<
      MutationDeleteAddressArgs,
      DeleteAddressResponse
    >({ mutationName: MutationName.DeleteAddress }, { address })

      toast.success('Address has been successfully removed')
    }
    catch (error: any) {
      toast.error(error?.data?.message)
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

    const data = await $sdk().odoo.mutation<
      MutationUpdateAddressArgs,
      SelectCurrentAddressResponse
    >({ mutationName: MutationName.UpdateAddress }, { address })

    if (type === AddressEnum.Billing) {
      const address = data?.updateAddress
      const index = billingAddresses.value.findIndex(
        addr => addr.id === address.id,
      )
      billingAddresses.value[index] = address
    }
    else {
      const address = data?.updateAddress
      const index = shippingAddresses.value.findIndex(
        addr => addr.id === address.id,
      )
      shippingAddresses.value[index] = address
    }

    toast.success('Address has been successfully updated')
    }
    catch (error: any) {
      toast.error(error?.data?.message)
    }
    finally {
      loading.value = false
    }
  }

  const selectCurrentAddress = async (
    address: SelectAddressInput,
    type: AddressEnum,
  ) => {
    try {
    loading.value = true

    await $sdk().odoo.mutation<
      MutationSelectAddressArgs,
      SelectCurrentAddressResponse
    >({ mutationName: MutationName.SelectCurrentAddress }, { address, type })

    await loadAddresses(type)
    toast.success(`Current ${type} address saved successfully`)
    }
    catch (error: any) {
      toast.error(error?.data?.message)
    }
    finally {
      loading.value = false
    }
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
