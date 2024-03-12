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
} from '~/graphql';
import { MutationName } from '~/server/mutations';
import { QueryName } from '~/server/queries';

export const useAddresses = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const billingAddresses = useState<Partner[]>('billing-addresses', () => []);
  const mailingAddresses = useState<Partner[]>('mailing-addresses', () => []);

  const loadAddressesByType = async (type: AddressEnum) => {
    loading.value = true;
    try {
      const { data } = await useAsyncData(`fetch-${type}-addresses`, async () => {
        const { data } = await $sdk().odoo.query<QueryAddressesArgs, AddressesResponse>(
          { queryName: QueryName.GetAddressesQuery },
          { filter: { addressType: [type] } },
        );
        return data.value;
      });

      if (data?.value) {
        if (type === AddressEnum.Billing) {
          billingAddresses.value = data.value.addresses;
        } else {
          mailingAddresses.value = data.value.addresses;
        }
      }
    } finally {
      loading.value = false;
    }
  };

  const addAddress = async (address: AddAddressInput, type: AddressEnum) => {
    loading.value = true;
    try {
      const { data } = await $sdk().odoo.mutation<MutationAddAddressArgs, AddAddressResponse>(
        { mutationName: MutationName.AddAddress },
        { address, type },
      );
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

  const updateAddress = async (address: UpdateAddressInput, type: AddressEnum) => {
    loading.value = true;
    try {
      const { data } = await $sdk().odoo.mutation<MutationUpdateAddressArgs, UpdateAddressResponse>(
        { mutationName: MutationName.UpdateAddress },
        { address },
      );
      if (data.value) {
        if (type === AddressEnum.Billing) {
          const address = data.value.updateAddress;
          const index = billingAddresses.value.findIndex((addr) => addr.id === address.id);
          billingAddresses.value[index] = address;
        } else {
          const address = data.value.updateAddress;
          const index = mailingAddresses.value.findIndex((addr) => addr.id === address.id);
          mailingAddresses.value[index] = address;
        }
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    loadAddressesByType,
    billingAddresses,
    mailingAddresses,
    addAddress,
    updateAddress,
    loading,
  };
};
