import { validateBlocks } from '#shared/cms/blocks'

/**
 * Save the draft. Replace-whole-list semantics, which is how the editor holds
 * state anyway.
 *
 * Everything written here goes through `validateBlocks` first (§6.3): unknown
 * block types are dropped, unknown keys are stripped, selects are clamped to
 * their options and links are rejected unless they start with / or http. A
 * draft is allowed to save WITH issues — merchants save half-finished work all
 * the time — and the issues are returned so the editor can show them. Publish
 * is the gate that refuses (see publish.post.ts).
 */
export default defineEventHandler(async (event) => {
  const store = useCmsStore(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody<{ blocks?: unknown }>(event)

  const { blocks, issues } = validateBlocks(body?.blocks ?? [])
  const page = await store.saveDraft(id, blocks)

  return { page, issues }
})
