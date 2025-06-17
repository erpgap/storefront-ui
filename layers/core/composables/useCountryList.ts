import { useToast } from 'vue-toastification'
import { QueryName } from '~/server/queries'

import type { Countries, CountriesResponse } from '~/graphql'

export const useCountryList = () => {
  const { $sdk } = useNuxtApp()
  const countries = useState('countries', () => ({}) as Countries)
  const toast = useToast()

  const loadCountries = async () => {
    try {
      const { data } = await useAsyncData(
        'countries',
        async () => await $sdk().odoo.query<null, CountriesResponse>({
          queryName: QueryName.GetCountriesQuery,
        }),
      )
      countries.value = data.value?.countries || ({} as Countries)
    }
    catch (error: any) {
      toast.error(error?.data?.message)
    }
  }

  return {
    loadCountries,
    countries,
  }
}
