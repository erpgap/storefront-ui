import { QueryName } from "~/server/queries";

import {
  type State,
  type CountryFilterInput,
  type StatesResponse,
} from "~/graphql";

export const useStateList = (countryId: number) => {
  const { $sdk } = useNuxtApp();
  const states = useState(`states-${String(countryId)}`, () => [] as State[]);

  const param = ref<CountryFilterInput>({ id: countryId });
  const loadStates = async () => {
    if (states.value.length > 0) {
      return;
    }
    const { data } = await $sdk().odoo.query<
      CountryFilterInput,
      StatesResponse
    >({ queryName: QueryName.GetStates }, param.value);

    states.value = data.value.country.states || [];
  };

  return {
    loadStates,
    states,
  };
};
