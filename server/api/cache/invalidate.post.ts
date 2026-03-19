import { getKeysByTag, removeTagRegistry } from '../../utils/cache'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const { path, tags, key } = body

  if (key !== process.env.NUXT_STORAGE_INVALIDATION_KEY) {
    throw createError({ statusCode: 401, message: 'Invalid Key' })
  }

  const storage = useStorage('cache')

  if (tags && Array.isArray(tags)) {
    const allKeysToInvalidate = new Set<string>()

    for (const tag of tags) {
      const keys = await getKeysByTag(tag)
      keys.forEach(k => allKeysToInvalidate.add(k))
      // await removeTagRegistry(tag)
    }

    const keysArray = Array.from(allKeysToInvalidate)
    for (const k of keysArray) {
      await storage.removeItem(k)
    }

    return {
      status: 'success',
      message: `Invalidated ${keysArray.length} keys by tags`,
      invalidatedTags: tags,
      invalidatedKeys: keysArray,
    }
  }

  if (path) {
    const allKeys = await storage.getKeys()
    const strippedPath = path.replace(/[^a-z0-9]/gi, '')
    const keysToDelete = allKeys.filter(k => k.replace(/[^a-z0-9]/gi, '').includes(strippedPath))

    for (const k of keysToDelete) {
      await storage.removeItem(k)
    }

    return {
      status: 'success',
      message: `Invalidated ${keysToDelete.length} keys for path: ${path}`,
      invalidatedKeys: keysToDelete,
    }
  }

  await storage.clear()
  return { status: 'success', message: 'All cache cleared' }
})
