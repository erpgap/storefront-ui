import { AddressEnum, AddressesResponse, Partner, PartnerResponse, QueryAddressesArgs } from '~/graphql';
import { QueryName } from '~/server/queries';

export const useAddresses = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const billingAddresses = useState<Partner[]>('billing-addresses', () => ([]));
  const mailingAddresses = useState<Partner[]>('mailing-addresses', () => ([]));

  const loadAddressesByType = async (type: AddressEnum) => {
    loading.value = true;
    try {
      const {data} = await useAsyncData('fetch-billing-addresses', async () => {
        const { data } = await $sdk().odoo.query<QueryAddressesArgs, AddressesResponse >({queryName: QueryName.GetAddresses}, {filter: {addressType: [type]}});
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

  return {
    loadAddressesByType,
    billingAddresses,
    mailingAddresses
  };
};
