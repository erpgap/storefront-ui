import { useAsyncData, useState, useNuxtApp } from 'nuxt/app'
import { QueryName } from '~~/server/queries'

import type { Countries } from '~~/graphql'

export const useCountryList = () => {
  const { $sdk } = useNuxtApp()
  const countries = useState('countries', () => ({}) as Countries)

  const loadCountries = async () => {
    // useAsyncData reports a failure in `error` rather than throwing it, and
    // the SDK plugin's toast already says why; the list just stays empty.
    const { data } = await useAsyncData(
      'countries',
      async () => await $sdk().odoo.query<null, { countries: Countries }>({
        queryName: QueryName.GetCountriesQuery,
      }),
    )
    countries.value = data.value?.countries || ({} as Countries)
  }

  return {
    loadCountries,
    countries,
  }
}
