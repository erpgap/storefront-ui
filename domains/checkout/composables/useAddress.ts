import { useToast } from "vue-toastification";
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
} from "~/graphql";
import { MutationName } from "~/server/mutations";
import { QueryName } from "~/server/queries";
import objectHash from "object-hash";

export const useAddresses = () => {
  const { $sdk } = useNuxtApp();
  const hash = objectHash("test");

  const loading = ref(false);
  const toast = useToast();

  const billingAddresses = useState<Partner[]>(
    `${hash}-billing-addresses`,
    () => []
  );
  const shippingAddresses = useState<Partner[]>("shipping-addresses", () => []);

  const loadAddresses = async (addressType: AddressEnum) => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.query<
      QueryAddressesArgs,
      AddressesResponse
    >(
      { queryName: QueryName.GetAddressesQuery },
      { filter: { addressType: addressType } }
    );

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    if (addressType === AddressEnum.Billing) {
      billingAddresses.value = data.value.addresses;
    } else {
      shippingAddresses.value = data.value.addresses;
    }

    loading.value = false;
  };

  const addAddress = async (address: AddAddressInput, type: AddressEnum) => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.mutation<
      MutationAddAddressArgs,
      AddAddressResponse
    >({ mutationName: MutationName.AddAddress }, { address, type });

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    loadAddresses(type);

    toast.success("Address has been successfully saved");
    loading.value = false;
  };

  const deleteAddress = async (address: DeleteAddressInput) => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.mutation<
      MutationDeleteAddressArgs,
      DeleteAddressResponse
    >({ mutationName: MutationName.DeleteAddress }, { address });

    if (error.value) {
      return toast.error(error.value.data.message);
    }
    toast.success("Address has been successfully removed");
    loading.value = false;
  };

  const updateAddress = async (
    address: UpdateAddressInput,
    type: AddressEnum
  ) => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.mutation<
      MutationUpdateAddressArgs,
      SelectCurrentAddressResponse
    >({ mutationName: MutationName.UpdateAddress }, { address });

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    if (type === AddressEnum.Billing) {
      const address = data.value.updateAddress;
      const index = billingAddresses.value.findIndex(
        (addr) => addr.id === address.id
      );
      billingAddresses.value[index] = address;
    } else {
      const address = data.value.updateAddress;
      const index = shippingAddresses.value.findIndex(
        (addr) => addr.id === address.id
      );
      shippingAddresses.value[index] = address;
    }

    toast.success("Address has been successfully updated");
    loading.value = false;
  };

  const selectCurrentAddress = async (
    address: SelectAddressInput,
    type: AddressEnum
  ) => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.mutation<
      MutationSelectAddressArgs,
      SelectCurrentAddressResponse
    >({ mutationName: MutationName.SelectCurrentAddress }, { address, type });

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    loadAddresses(type);

    toast.success(`Current ${type} address saved successfully`);
    loading.value = false;
  };

  return {
    loadAddresses,
    billingAddresses,
    shippingAddresses,
    selectCurrentAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    loading,
  };
};
