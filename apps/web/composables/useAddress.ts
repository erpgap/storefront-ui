import {
  AddressEnum,
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
  AddressFilterInput,
} from "~/graphql";
import { MutationName } from "~/server/mutations";
import { QueryName } from "~/server/queries";
import { useToast } from "vue-toastification";

export const useAddresses = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const toast = useToast();
  const billingAddresses = useState<Partner[]>("billing-addresses", () => []);
  const mailingAddresses = useState<Partner[]>("mailing-addresses", () => []);
  const currentBillingAddress = useState<Partner>(
    "current-billing-address",
    () => ({}) as Partner
  );
  const currentMailingAddress = useState<Partner>(
    "current-mailing-address",
    () => ({}) as Partner
  );

  const loadAddressesByType = async (type: AddressFilterInput) => {
    loading.value = true;
    try {
      const { data, error } = await $sdk().odoo.query<
        QueryAddressesArgs,
        AddressesResponse
      >(
        { queryName: QueryName.GetAddressesQuery },
        { filter: { addressType: type } }
      );

      if (error.value) {
        return toast.error(error.value.data.message);
      }

      if (type === AddressEnum.Billing) {
        billingAddresses.value = data.value.addresses;
      } else {
        mailingAddresses.value = data.value.addresses;
      }
    } finally {
      loading.value = false;
    }
  };

  const addAddress = async (address: AddAddressInput, type: AddressEnum) => {
    loading.value = true;
    try {
      const { data } = await $sdk().odoo.mutation<
        MutationAddAddressArgs,
        AddAddressResponse
      >({ mutationName: MutationName.AddAddress }, { address, type });
      if (data.value) {
        if (type === AddressEnum.Billing) {
          billingAddresses.value.push(data.value.addAddress);
        } else {
          mailingAddresses.value.push(data.value.addAddress);
        }
      }
    } finally {
      loading.value = false;
    }
  };

  const deleteAddress = async (address: DeleteAddressInput) => {
    loading.value = true;
    try {
      const { data, error } = await $sdk().odoo.mutation<
        MutationDeleteAddressArgs,
        DeleteAddressResponse
      >({ mutationName: MutationName.DeleteAddress }, { address });

      if (error.value) {
        return toast.error(error.value.data.message);
      }

      toast.success("Address has been successfully removed");
    } finally {
      loading.value = false;
    }
  };

  const updateAddress = async (
    address: UpdateAddressInput,
    type: AddressEnum
  ) => {
    loading.value = true;
    try {
      const { data } = await $sdk().odoo.mutation<
        MutationUpdateAddressArgs,
        SelectCurrentAddressResponse
      >({ mutationName: MutationName.UpdateAddress }, { address });
      if (data.value) {
        if (type === AddressEnum.Billing) {
          const address = data.value.updateAddress;
          const index = billingAddresses.value.findIndex(
            (addr) => addr.id === address.id
          );
          billingAddresses.value[index] = address;
        } else {
          const address = data.value.updateAddress;
          const index = mailingAddresses.value.findIndex(
            (addr) => addr.id === address.id
          );
          mailingAddresses.value[index] = address;
        }
      }
    } finally {
      loading.value = false;
    }
  };

  const selectCurrentAddress = async (
    address: SelectAddressInput,
    type: AddressEnum
  ) => {
    loading.value = true;
    try {
      const { data, error } = await $sdk().odoo.mutation<
        MutationSelectAddressArgs,
        SelectCurrentAddressResponse
      >({ mutationName: MutationName.SelectCurrentAddress }, { address, type });

      if (error.value) {
        return toast.error(error.value.data.message);
      }

      if (type === AddressEnum.Billing) {
        currentBillingAddress.value = data.value;
        toast.success("Current billing address saved successfully");
        return;
      }
      currentMailingAddress.value = data.value;
      toast.success("Current mailing address saved successfully");
    } finally {
      loading.value = false;
    }
  };

  return {
    loadAddressesByType,
    billingAddresses,
    mailingAddresses,
    currentBillingAddress,
    currentMailingAddress,
    selectCurrentAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    loading,
  };
};
