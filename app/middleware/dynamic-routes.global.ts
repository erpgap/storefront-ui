import { useRouter } from 'nuxt/app'

/**
 * Routes every URL the build did not know, through the slug keys Odoo keeps
 * in Redis (`slug:<url>` -> model), without asking Odoo whether it exists.
 *
 * A URL with no key is a 404. Products and categories get a route of their
 * own on the fly; a CMS page is left to the catch-all that renders it.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // A real route claimed it. The CMS catch-all matches everything, so it
  // flags itself rather than counting as a claim.
  const unclaimed = to.matched.length === 0 || to.meta.catchAll === true
  if (!unclaimed || to.path.startsWith('/api/')) {
    return
  }

  const router = useRouter()
  // Odoo stores addresses without a trailing slash.
  const slug = to.path.replace(/(.)\/$/, '$1')

  const notFound = () => abortNavigation(createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  }))

  let routeType: string | null | undefined
  try {
    const { data: routeData } = await useFetch(`/api/route-resolver`, {
      params: {
        slug,
      },
    })
    routeType = routeData.value?.data
  }
  catch (error) {
    console.error('[dynamic-routes] Error in dynamic route middleware:', error)
  }

  if (!routeType) {
    return notFound()
  }

  if (routeType === 'websitePage') {
    // Rendered by the catch-all, when the CMS layer is there to provide one.
    return to.meta.catchAll ? undefined : notFound()
  }

  const routeComponents = {
    category: () => import('#layers/category/custom-pages/category-page.vue'),
    product: () => import('#layers/product/custom-pages/product-page.vue'),
  }

  const component = routeComponents[routeType as keyof typeof routeComponents]
  if (!component) {
    console.warn('[dynamic-routes] Invalid route type:', routeType)
    return notFound()
  }

  router.addRoute({
    path: to.path,
    name: slug.replace(/^\//, '').replace(/\//g, '-'),
    component: component,
  })

  return to.fullPath
})
