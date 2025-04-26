import { initSDK, buildModule } from '@vue-storefront/sdk'
import type { OdooModuleType } from '@erpgap/odoo-sdk'
import { OdooModule } from '@erpgap/odoo-sdk'
import { useToast } from 'vue-toastification'
import { defineNuxtPlugin } from '#app'

const SHOULD_BYPASS_ERROR_QUERIES = [
  'LoadUserQuery',
  'LoadCartQuery',
]

const avoidErrorThrowForSomeRequests = (options: any) => {
  if (options.body) {
    try {
      const queryName = JSON.parse(options.body)?.[0]?.queryName

      if (SHOULD_BYPASS_ERROR_QUERIES?.includes(queryName)) {
        return true
      }

      return false
    }
    catch (error) {
      return false
    }
  }
}

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  const sdkConfig = {
    odoo: buildModule<OdooModuleType>(OdooModule, {
      apiUrl: `${config.public.middlewareUrl}api/odoo/`,
      ofetch: $fetch.create({
        credentials: 'include',
        onResponseError({ request, response, options }) {
          if (avoidErrorThrowForSomeRequests(options) && response.status === 500) {
            return
          }
          if (
            response.status === 500
            && response._data
            && response._data?.data?.length > 0
          ) {
            const toast = useToast()
            toast.error(response?._data?.message)
          }
        },
      }),
    }),
  }

  return {
    provide: {
      sdk: () => initSDK<typeof sdkConfig>(sdkConfig),
    },
  }
})
