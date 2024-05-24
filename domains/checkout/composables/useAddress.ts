import type {
  AddressesResponse,
  Partner,
  QueryAddressesArgs,
  AddAddressInput,
  MutationAddAddressArgs,
  UpdateAddressInput,
  MutationUpdateAddressArgs,
  AddAddressResponse,
  SelectAddressInput,
  MutationSelectAddressArgs,
  SelectCurrentAddressResponse,
  DeleteAddressInput,
  MutationDeleteAddressArgs,
  DeleteAddressResponse,
} from "~/graphql";
import { AddressEnum } from "~/graphql";
import { MutationName } from "~/server/mutations";
import { QueryName } from "~/server/queries";
import { useToast } from "vue-toastification";

export const useAddresses = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const toast = useToast();
  const billingAddresses = useState<Partner[]>("billing-addresses", () => []);
  const shippingAddresses = useState<Partner[]>("shipping", () => []);

  const loadBillingAddresses = async () => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.query<
      QueryAddressesArgs,
      AddressesResponse
    >(
      { queryName: QueryName.GetAddressesQuery },
      { filter: { addressType: [AddressEnum.Billing] } }
    );

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    billingAddresses.value = data.value.addresses;

    loading.value = false;
  };

  const loadShippingAddresses = async () => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.query<
      QueryAddressesArgs,
      AddressesResponse
    >(
      { queryName: QueryName.GetAddressesQuery },
      { filter: { addressType: [AddressEnum.Shipping] } }
    );

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    shippingAddresses.value = data.value.addresses;
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
    if (type === AddressEnum.Billing) {
      loadBillingAddresses();
    } else {
      loadShippingAddresses();
    }

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

    toast.success(`Current ${type} address saved successfully`);
    loading.value = false;
  };

  return {
    loadBillingAddresses,
    loadShippingAddresses,
    billingAddresses,
    shippingAddresses,
    selectCurrentAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    loading,
  };
};
