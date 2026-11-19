import { useAsyncData, useNuxtApp, useState } from 'nuxt/app'
import { QueryName } from '~~/server/queries'

import type {
  State,
  CountryFilterInput,
  Country,
} from '~~/graphql'

export const useStateList = (countryId: number) => {
  const { $sdk } = useNuxtApp()
  const states = useState(`states-${String(countryId)}`, () => [] as State[])

  const param = ref<CountryFilterInput>({ id: countryId })
  const loadStates = async () => {
    if (states.value.length > 0) {
      return
    }
    // useAsyncData reports a failure in `error` rather than throwing it: the
    // list stays empty, and a state is then not asked for.
    const { data } = await useAsyncData(
      async () => await $sdk().odoo.query<
        CountryFilterInput,
        { country: Country }
      >({ queryName: QueryName.GetStatesQuery }, param.value), {
        deep: true,
      })
    states.value = data.value?.country?.states || []
  }

  return {
    loadStates,
    states,
  }
}
