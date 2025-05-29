import { useRouter } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware if route exists in the static route tree
  if (to.matched.length > 0) {
    return
  }

  const router = useRouter()
  const slug = to.path.replace(/^\//, '') // Remove leading slash

  try {
    // Check if route exists in Redis
    const { data: routeData } = await useFetch(`/api/route-resolver/${slug}`)

    if (!routeData.value?.data) {
      console.warn('Route does not exist or invalid:', slug)
      return
    }

    // Map route types to their components
    const routeComponents = {
      category: () => import('~/domains/category/pages/category/[id].vue'),
      product: () => import('~/domains/product/custom-pages/[slug].vue'),
    }

    const component = routeComponents[routeData.value.data as keyof typeof routeComponents]

    console.info('component', component)
    if (!component) {
      console.warn('No component found for type:', routeData.value.data)
      return
    }

    // Add the new route dynamically
    router.addRoute({
      path: `/${slug}`,
      component,
      // props: {
      //   id: routeData.value?.id,
      //   slug,
      // },
    })

    // Trigger the route replacement
    return router.replace(to.fullPath)
  }
  catch (error) {
    console.error('Error in dynamic route middleware:', error)
    return
  }
})
