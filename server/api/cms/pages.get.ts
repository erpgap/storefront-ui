// Page list for the studio.
export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const pages = await store.list()

  // The list view never needs block bodies — keep the payload small.
  return pages.map(({ draft, publishedBlocks, ...page }) => ({
    ...page,
    blockCount: draft.length,
    hasUnpublishedChanges:
      JSON.stringify(draft) !== JSON.stringify(publishedBlocks),
  }))
})
