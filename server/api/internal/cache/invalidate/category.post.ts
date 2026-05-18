import { assertCacheInvalidationAccess } from '../../../../utils/cacheInvalidationSecurity'
import {
  invalidatePageAndRelatedCache,
  type InvalidateCacheInput,
} from '../../../../utils/cacheInvalidation'

export default defineEventHandler(async (event) => {
  const body = await readBody<InvalidateCacheInput>(event)

  assertCacheInvalidationAccess(event, body ?? {})

  if (!body?.path && !body?.url) {
    throw createError({ statusCode: 400, message: 'Request body must include "path" or "url"' })
  }

  const result = await invalidatePageAndRelatedCache({ ...body, pageType: 'category' })

  return {
    ok: true,
    dryRun: result.dryRun,
    pageType: result.pageType,
    normalizedPath: result.normalizedPath,
    pageKeys: result.pageKeys,
    dataKeys: result.dataKeys,
    deletedCount: result.dryRun ? 0 : result.deletedKeys.length,
  }
})
