import { initSDK, buildModule } from '@vue-storefront/sdk'
import { OdooModule } from '@erpgap/odoo-sdk'
import type { $Fetch } from 'ofetch'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()

  // On the client `credentials: 'include'` sends cookies automatically, but
  // during SSR the internal $fetch to our API routes does NOT forward the
  // incoming request cookies. Without this, server-side calls (e.g. the session
  // whoami in `auth-check`) look unauthenticated and would wrongly sign the user
  // out. Capture the cookie header HERE, in valid Nuxt context — calling
  // useRequestHeaders() inside ofetch's onRequest runs after the async context
  // is lost and throws "[nuxt] instance unavailable", breaking SSR data fetches.
  const ssrCookie = import.meta.server
    ? useRequestHeaders(['cookie'])?.cookie
    : undefined

  const sdkConfig = {
    odoo: buildModule(OdooModule, {
      apiUrl: `${config.public.middlewareUrl}/api/odoo/`,
      // Nuxt's $fetch is an ofetch instance; Nitro's type for it just leaves
      // out `native`, which the SDK's ofetch type requires.
      ofetch: $fetch.create({
        credentials: 'include',
        onRequest({ options }) {
          if (import.meta.server && ssrCookie) {
            options.headers = new Headers(options.headers)
            options.headers.set('cookie', ssrCookie)
          }
        },
      }) as $Fetch,
    }),
  }

  return {
    provide: {
      sdk: () => initSDK<typeof sdkConfig>(sdkConfig),
    },
  }
})
