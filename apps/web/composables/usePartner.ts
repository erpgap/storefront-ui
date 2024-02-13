import { Partner, MutationCreateUpdatePartnerArgs, PartnerResponse} from '~/graphql';
import { MutationName } from '~/server/mutations';

export const usePartner = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const partner = useState<Partner>('partner', () => ({} as Partner));

  const updatePartner = async (params: MutationCreateUpdatePartnerArgs) => {
    loading.value = true;
    try {
      const { data } = await useAsyncData('update-partner', async () => {
        const { data } = await $sdk().odoo.query<
          MutationCreateUpdatePartnerArgs,
          PartnerResponse
        >({ queryName: MutationName.CreateNewAccountMutation }, params);
        return data.value;
      });

      if (data.value) {
        partner.value = data.value;
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    updatePartner,
    partner,
    loading,
  };
};
