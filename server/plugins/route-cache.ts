import generateFlags from '@nuxtjs/device/runtime/generateFlags'
import type { EventHandler, RouterMethod, H3Event } from 'h3'
import { registerDependency } from '../utils/cache'

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

const getPageKey = (event: H3Event) => {
  const headers = getRequestHeaders(event)
  const userAgent = headers['user-agent']
  const path = event.path

  const name = path.replace(/^\//, '').replace(/\//g, ':')
  let key = ''

  if (!userAgent) {
    key = `desktop-${path}`
  }
  else {
    const flags = generateFlags(headers, String(userAgent))
    key = flags.isDesktop ? `desktop-${path}` : `mobile-${path}`
  }

  const sanitizedKey = key.replace(/[^a-z0-9]/gi, '')
  return `pages:${name}:${sanitizedKey}.json`
}

export default defineNitroPlugin((nitroApp) => {
  const handlerList: Handler[] = eval('handlers')

  const skipRoutesSet = new Set(routesToSkipCache)

  const enHandler = handlerList.filter((r) => {
    const isRouteToSkip = skipRoutesSet.has(r.route)

    return !isRouteToSkip
  })

  nitroApp.hooks.hook('beforeResponse', async (event) => {
    let tagsHeader = getResponseHeader(event, 'x-cache-tags')

    if (Array.isArray(tagsHeader)) {
      tagsHeader = tagsHeader.join(',')
    }

    if (tagsHeader) {
      const pageKey = getPageKey(event)
      const tags = tagsHeader.split(',')
      for (const tag of tags) {
        await registerDependency(tag.trim(), pageKey)
      }
    }
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
            const userAgent = headers['user-agent']
            if (!userAgent) {
              return `desktop-${event.path}`
            }
            const flags = generateFlags(headers, String(userAgent))

            if (flags.isDesktop) {
              return `desktop-${event.path}`
            }
            return `mobile-${event.path}`
          },
          shouldInvalidateCache: (event: H3Event) => {
            return false
          },
          maxAge: Number(process.env?.NUXT_SWR_CACHE_TIME || 3600),
          swr: true,
          staleMaxAge: Number(process.env?.NUXT_SWR_CACHE_TIME || 3600),
          shouldBypassCache: (event: H3Event) => {
            return event.path === '/cart' || event.path.startsWith('/my-account/')
          },
        },
      )
      nitroApp.router.use(handler.route, customHandler)
    })
  }
})
