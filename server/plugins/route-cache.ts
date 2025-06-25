import generateFlags from '@nuxtjs/device/runtime/generateFlags'
import type { EventHandler, RouterMethod, H3Event } from 'h3'

type Handler = {
  route: string
  handler: () => EventHandler | Promise<EventHandler>
  middleware: boolean
  method: RouterMethod | RouterMethod[]
}

export default defineNitroPlugin((nitroApp) => {
  const handlerList: Handler[] = eval('handlers')

  const enHandler = handlerList.filter((r) => {
    return (
      r.route === '/'
      || r.route === '/product/**'
      || r.route === '/category/**'
    )
  })

  if (enHandler.length > 0) {
    enHandler.forEach((handler) => {
      const customHandler = cachedEventHandler(
        lazyEventHandler(handler.handler),
        {
          varies: ['user-agent', 'cookie'],
          group: 'pages',
          name: handler.route,
          getKey: (event: H3Event) => {
            const headers = getRequestHeaders(event)
            const userAgent: any = headers['user-agent']
            const countryIsoCode: any = getCookie(event, 'country-iso-code') || 'US'

            const flags = generateFlags(headers, userAgent)

            if (flags.isDesktop) {
              return `desktop-${countryIsoCode}-${event.path}`
            }
            return `mobile-${countryIsoCode}-${event.path}`
          },
          shouldInvalidateCache: (event: H3Event) => {
            return false
          },
          maxAge: Number(process.env?.NUXT_SWR_CACHE_TIME),
          swr: true,
          staleMaxAge: Number(process.env?.NUXT_SWR_CACHE_TIME),
          shouldBypassCache: (event: H3Event) => {
            return false
          },
        },
      )
      nitroApp.router.use(handler.route, customHandler)
    })
  }
})
