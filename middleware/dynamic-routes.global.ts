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
    const { data: routeData } = await useFetch(`/api/route-resolver/${slug}`, {
      transform: (response) => {
        if (!response) return { exists: false }
        return response as { exists: boolean, type?: string }
      }
    })

    // If route doesn't exist, let Nuxt handle 404
    if (!routeData.value?.exists || !routeData.value?.type) {
      console.warn('Route does not exist or invalid:', slug)
      return
    }

    const routeType = routeData.value.type

    // Map route types to their page paths
    const routePaths = {
      category: `/category/${slug}`,
      product: `/product/${slug}`,
      blog: `/blog/${slug}`
    } as const

    // Get the path for this route type
    const redirectPath = routePaths[routeType as keyof typeof routePaths]

    if (!redirectPath) {
      console.warn('No route path found for type:', routeType)
      return
    }

    // Redirect to the appropriate page
    return navigateTo(redirectPath, { 
      redirectCode: 301,
      replace: true 
    })
  } catch (error) {
    console.error('Error in dynamic route middleware:', error)
    return
  }
})