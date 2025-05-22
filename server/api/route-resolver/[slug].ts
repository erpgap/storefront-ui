export default defineEventHandler(async (event) => {
  // Handle potential undefined params
  const slug = event.context.params?.slug
  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug parameter is required'
    })
  }

  // Single Redis key check with JSON value
  const redisKey = `cache:slug:${slug}`
  console.info('redisKey', redisKey)
  const routeData = await useStorage().getItem(redisKey)
  console.info('routeData', routeData)

  if (routeData) {
    try {
      // If stored as string, parse it
      const data = typeof routeData === 'string' ? JSON.parse(routeData) : routeData
      
      return {
        exists: true,
        type: data.type,
      }
    } catch (error) {
      console.error('Error parsing route data:', error)
      throw createError({
        statusCode: 500,
        message: 'Error processing route data'
      })
    }
  }
  
  return {
    exists: false
  }
}) 