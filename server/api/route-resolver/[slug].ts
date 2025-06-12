export default defineEventHandler(async (event) => {
  // Handle potential undefined params
  const slug = event.context.params?.slug
  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug parameter is required',
    })
  }

  const redisKey = `slug:${slug}`
  const data = await useStorage<string>('slug').getItem(redisKey)

  if (data) {
    try {

      const modelToRouteType = {
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
