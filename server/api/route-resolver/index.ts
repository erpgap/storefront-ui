export default defineEventHandler(async (event) => {
  // Get slug from query parameters
  const query = getQuery(event)
  const slug = query.slug as string
  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug parameter is required',
    })
  }

  const redisKey = `slug:${encodeURIComponent(slug)}`
  const data = await useStorage<string>('slug').getItem(redisKey)

  if (data) {
    try {
      const modelToRouteType: Record<string, string> = {
        'product.template': 'product',
        'product.public.category': 'category',
        'alokai.website.page': 'websitePage',
      }

      return {
        data: modelToRouteType[data],
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
    data: null,
  }
})
