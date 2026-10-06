// Page list for the editor.
export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const pages = await store.list()

  // The counts come from the backend, which can see the blocks; this response
  // deliberately does not carry them. Deriving the summary here instead meant
  // computing it from data the list query never fetched, so every page
  // reported zero blocks and no unpublished changes.
  return pages.map(({ draft, publishedBlocks, ...page }) => ({
    ...page,
    blockCount: (page as { blockCount?: number }).blockCount ?? draft.length,
    hasUnpublishedChanges:
      (page as { hasUnpublishedChanges?: boolean }).hasUnpublishedChanges
      ?? JSON.stringify(draft) !== JSON.stringify(publishedBlocks),
  }))
})
