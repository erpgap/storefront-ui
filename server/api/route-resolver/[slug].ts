export default defineEventHandler(async (event) => {
  // Handle potential undefined params
  const slug = event.context.params?.slug
  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug parameter is required',
    })
  }

  // Single Redis key check with JSON value
  const redisKey = `cache:slug:${slug}`
  const routeData = await useStorage().getItem(redisKey)

  if (routeData) {
    try {
      // If stored as string, parse it
      console.info('data', routeData)
      const data = typeof routeData === 'string' ? JSON.parse(routeData) : routeData

      // Define model type mapping
      const modelToRouteType = {
        'product.template': 'product',
        'product.public.category': 'category',
      }

      return {
        data: modelToRouteType[data.value],
      }
    }
    catch (error) {
      console.error('Error parsing route data:', error)
      throw createError({
        statusCode: 500,
        message: 'Error processing route data',
      })
    }
  }

  return {
    exists: false,
  }
})
