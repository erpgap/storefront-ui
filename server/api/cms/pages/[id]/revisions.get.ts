import { createOdooCmsStore } from '~~/server/utils/cmsOdooStore'

// Version history.
export default defineEventHandler(async (event) => {
  return createOdooCmsStore(event).revisions(getRouterParam(event, 'id')!)
})
