import generateFlags from '@nuxtjs/device/runtime/generateFlags'
import type { EventHandler, RouterMethod, H3Event } from 'h3'

const routesToSkipCache = [
  '/api/odoo/all',
  '/api/odoo/query-no-cache',
  '/api/route-resolver',
  '/api/sitemap/urls/categories',
  '/api/sitemap/urls/products',
  '/web/health',
  '/__nuxt_error',
  '',
  '/__site-config__/debug.json',
  '/robots.txt',
  '/__robots__/debug.json',
  '/__robots__/debug-path.json',
  '/__sitemap__/debug.json',
  '/__sitemap__/style.xsl',
  '/sitemap.xml',
  '/__nuxt_island/**',
  '/_ipx/**',
  '/_scripts/**',
]

type Handler = {
  route: string
  handler: () => EventHandler | Promise<EventHandler>
  middleware: boolean
  method: RouterMethod | RouterMethod[]
}

export default defineNitroPlugin((nitroApp) => {
  const handlerList: Handler[] = eval('handlers')

  const skipRoutesSet = new Set(routesToSkipCache)

  const enHandler = handlerList.filter((r) => {
    const isRouteToSkip = skipRoutesSet.has(r.route)

    return !isRouteToSkip || r.route === '/**'
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

            const flags = generateFlags(headers, userAgent)

            if (flags.isDesktop) {
              return `desktop-${event.path}`
            }
            return `mobile-${event.path}`
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
