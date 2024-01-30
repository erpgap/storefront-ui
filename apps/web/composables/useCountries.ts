import { Country, CountryListResponse, CountryStatesResponse, QueryCountriesArgs, QueryCountryArgs, State } from '~/graphql';
import { QueryName } from '~/server/queries';

export const useCountries = () => {
  const { $sdk } = useNuxtApp();

  const loading = ref(false);
  const countries = useState<Country[]>('countries', () => ([]));
  const countryStates = useState<State[]>('country-states', () => ([]));

  const loadCountries = async () => {
    loading.value = true;
    try {
      const { data } = await $sdk().odoo.query<QueryCountriesArgs, CountryListResponse >({queryName: QueryName.GetCountries}, {pageSize: 250});
      if (data?.value?.countries) {
        countries.value = data.value.countries.countries;
      }
    } finally {
      loading.value = false;
    }

  };

  const loadCountryStates = async(countryId: number | string) => {
    if (!countryId) return;
    loading.value = true;
    try {
      const { data } = await $sdk().odoo.query<QueryCountryArgs, CountryStatesResponse>({queryName: QueryName.GetCountryState}, {id: parseInt(countryId)});
      return data.value;
    } finally {
      loading.value = false;
    }
  };

  return {
    loadCountries,
    loadCountryStates,
    countryStates,
    countries
  };
};
