import { useRouter } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware if route exists in the static route tree
  if (to.matched.length > 0) {
    return
  }

  // Get the slug from the current route
  const slug = to.path.replace(/^\//, '') // Remove leading slash

  try {
    // Check if route exists in Redis
    const { data: routeData } = await useFetch(`/api/route-resolver/${slug}`)

    console.info('routeData from middleware', routeData.value)

    // If route doesn't exist, let Nuxt handle 404
    if (!routeData.value) {
      console.warn('Route does not exist or invalid:', slug)
      return
    }

    // Map route types to their page paths
    const routePaths = {
      category: `/category/${slug}`,
      product: `/custom-pages/${slug}`,
    } as const

    // Get the path for this route type
    const redirectPath = routePaths[routeData.value as keyof typeof routePaths]

    if (!redirectPath) {
      console.warn('No route path found for type:', routeData.value)
      return
    }

    // Redirect to the appropriate page
    return navigateTo(redirectPath, {
      redirectCode: 301,
      replace: true,
    })
  }
  catch (error) {
    console.error('Error in dynamic route middleware:', error)
    return
  }
})
