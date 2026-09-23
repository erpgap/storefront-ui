// Reset the draft back to what is live. The merchant's "undo everything".
export default defineEventHandler(async (event) =>
  cmsStore.discardDraft(getRouterParam(event, 'id')!),
)
