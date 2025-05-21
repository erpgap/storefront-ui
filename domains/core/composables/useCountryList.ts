import { useToast } from 'vue-toastification'
import { QueryName } from '~/server/queries'

import type { Countries, CountriesResponse } from '~/graphql'

export const useCountryList = () => {
  const { $sdk } = useNuxtApp()
  const countries = useState('cuntries', () => ({}) as Countries)

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
      if (error.value) {
        return useToast().error(error.value.data.message)
      }
    }
    finally {
      // loading.value = false
    }

    /* const { data } = await $sdk().odoo.query<null, CountriesResponse>({
      queryName: QueryName.GetCountriesQuery,
    })

    countries.value = data.value.countries || ({} as Countries) */
  }

  return {
    loadCountries,
    countries,
  }
}
