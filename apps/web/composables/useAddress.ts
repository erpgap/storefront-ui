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
  UpdateAddressResponse,
} from "~/graphql";
import { MutationName } from "~/server/mutations";
import { QueryName } from "~/server/queries";

export const useAddresses = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const billingAddresses = useState<Partner[]>("billing-addresses", () => []);
  const shippingAddresses = useState<Partner[]>("shipping-addresses", () => []);

  const loadAddressesByType = async (type: AddressEnum) => {
    loading.value = true;

    const { data } = await $sdk().odoo.query<
      QueryAddressesArgs,
      AddressesResponse
    >(
      { queryName: QueryName.GetAddressesQuery },
      { filter: { addressType: [type] } }
    );
    console.log(data.value);

    loading.value = false;

    if (data?.value && type === AddressEnum.Billing) {
      billingAddresses.value = data.value.addresses;
    } else {
      shippingAddresses.value = data.value.addresses;
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
          shippingAddresses.value.push(data.value.addAddress);
        }
      }
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
        UpdateAddressResponse
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
          const index = shippingAddresses.value.findIndex(
            (addr) => addr.id === address.id
          );
          shippingAddresses.value[index] = address;
        }
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    loadAddressesByType,
    billingAddresses,
    shippingAddresses,
    addAddress,
    updateAddress,
    loading,
  };
};
