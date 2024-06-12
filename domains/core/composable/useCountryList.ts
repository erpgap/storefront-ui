import { QueryName } from "~/server/queries";

import { type Countries, type CountriesResponse } from "~/graphql";

export const useCountryList = () => {
  const { $sdk } = useNuxtApp();
  const countries = useState("cuntries", () => ({}) as Countries);

  const loadCountries = async () => {
    const { data } = await $sdk().odoo.query<null, CountriesResponse>({
      queryName: QueryName.GetCountriesQuery,
    });

    countries.value = data.value.countries || ({} as Countries);
  };

  return {
    loadCountries,
    countries,
  };
};
