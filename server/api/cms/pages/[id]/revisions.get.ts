import { createOdooCmsStore } from '~~/server/utils/cmsOdooStore'

// Version history. Odoo-only: the file store has no revisions, which is one of
// the things that made it a proof of concept rather than an implementation.
export default defineEventHandler(async (event) => {
  if (process.env.NUXT_CMS_BACKEND === 'file') return []
  return createOdooCmsStore(event).revisions(getRouterParam(event, 'id')!)
})
