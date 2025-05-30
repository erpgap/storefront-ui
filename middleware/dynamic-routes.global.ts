import { useRouter } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware if route exists in the static route tree
  if (to.matched.length > 0 || to.path.startsWith('/api/')) {
    return
  }

  const router = useRouter()
  const slug = to.path.replace(/^\//, '') // Remove leading slash

  try {
    // Check if route exists in Redis
    const { data: routeData } = await useFetch(`/api/route-resolver/${slug}`)

    if (!routeData?.value?.data) {
      console.warn('Route does not exist or invalid:', slug)
      return
    }

    // Map route types to their components
    const routeComponents = {
      category: () => import('~/domains/category/pages/category-page.vue'),
      product: () => import('~/domains/product/pages/product-page.vue'),
    }

    const routeType = routeData.value.data as keyof typeof routeComponents
    const component = routeComponents[routeType]

    if (!component) {
      console.warn('Invalid route type:', routeType)
      return
    }

    // Add the new route dynamically
    router.addRoute({
      path: to.path,
      name: slug,
      component: component,
    })

    return to.fullPath
  }
  catch (error) {
    console.error('Error in dynamic route middleware:', error)
    return
  }
})
