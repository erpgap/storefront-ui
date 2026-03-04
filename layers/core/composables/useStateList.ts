import { useToast } from 'vue-toastification'
import { QueryName } from '~~/server/queries'

import type {
  State,
  CountryFilterInput,
  StatesResponse,
} from '~~/graphql'
import { useAsyncData, useNuxtApp } from 'nuxt/app'
import { useState } from 'nuxt/app'

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
      >({ queryName: QueryName.GetStatesQuery }, param.value), {
        deep: true
      })
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
function ref<T>(arg0: { id: number }) {
  throw new Error('Function not implemented.')
}

