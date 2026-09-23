export default defineEventHandler(async (event) =>
  cmsStore.unpublish(getRouterParam(event, 'id')!),
)
