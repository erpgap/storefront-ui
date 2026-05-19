import { assertCacheInvalidationAccess } from '../../../../utils/cacheInvalidationSecurity'
import {
  invalidatePageAndRelatedCache,
  type InvalidateCacheInput,
} from '../../../../utils/cacheInvalidation'

export default defineEventHandler(async (event) => {
  const body = await readBody<InvalidateCacheInput>(event)

  assertCacheInvalidationAccess(event, body ?? {})

  const result = await invalidatePageAndRelatedCache({
    ...body,
    path: '/',
    pageType: 'homepage',
  })

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
