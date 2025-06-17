import { useRouter } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware if route exists in the static route tree
  if (to.matched.length > 0 || to.path.startsWith('/api/')) {
    return
  }

  const router = useRouter()
  const slug = to.path.replace(/^\//, '')

  try {
    const { data: routeData } = await useFetch(`/api/route-resolver/${slug}`)

    if (!routeData?.value?.data) {
      console.warn('[dynamic-routes] Route does not exist or invalid:', slug)
      return
    }

    const routeComponents = {
      category: () => import('~/layers/category/custom-pages/category-page.vue'),
      product: () => import('~/layers/product/custom-pages/product-page.vue'),
    }

    const routeType = routeData.value.data as keyof typeof routeComponents
    const component = routeComponents[routeType]

    if (!component) {
      console.warn('[dynamic-routes] Invalid route type:', routeType)
      return
    }

    // Add the new route dynamically
    router.addRoute({
      path: to.path,
      name: slug.replace('/', ''),
      component: component,
    })

    return to.fullPath
  }
  catch (error) {
    console.error('[dynamic-routes] Error in dynamic route middleware:', error)
    return
  }
})
