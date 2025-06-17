import { useToast } from 'vue-toastification'
import { QueryName } from '~/server/queries'

import type {
  State,
  CountryFilterInput,
  StatesResponse,
} from '~/graphql'

export const useStateList = (countryId: number) => {
  const { $sdk } = useNuxtApp()
  const states = useState(`states-${String(countryId)}`, () => [] as State[])

  const param = ref<CountryFilterInput>({ id: countryId })
  const loadStates = async () => {
    if (states.value.length > 0) {
      return
    }
    try {
      const { data } = await useAsyncData(
        async () => await $sdk().odoo.query<
          CountryFilterInput,
          StatesResponse
        >({ queryName: QueryName.GetStates }, param.value),
      )
      states.value = data.value?.country.states || []
    }
    catch (error: any) {
      if (error.value) {
        return useToast().error(error.value.data.message)
      }
    }
  }

  return {
    loadStates,
    states,
  }
}
