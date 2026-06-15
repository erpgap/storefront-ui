import { initSDK, buildModule } from '@vue-storefront/sdk'
import type { OdooModuleType } from '@erpgap/odoo-sdk'
import { OdooModule } from '@erpgap/odoo-sdk'
import { useToast } from 'vue-toastification'
import { defineNuxtPlugin } from 'nuxt/app'

// Requests whose errors are handled inline by their own flow (so the global
// error toast must NOT also fire — avoids duplicate/clashing feedback).
const SHOULD_BYPASS_ERROR_QUERIES = [
  'LoadUserQuery',
  'LoadCartQuery',
]
const SHOULD_BYPASS_ERROR_MUTATIONS = [
  'LoginMutation',
  'RegisterUserMutation',
  'ContactUsMutation',
  'NewsletterSubscribeMutation',
]

const avoidErrorThrowForSomeRequests = (options: any) => {
  if (options.body) {
    try {
      const payload = JSON.parse(options.body)?.[0] ?? {}

      if (SHOULD_BYPASS_ERROR_QUERIES?.includes(payload?.queryName)) {
        return true
      }
      if (SHOULD_BYPASS_ERROR_MUTATIONS?.includes(payload?.mutationName)) {
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
