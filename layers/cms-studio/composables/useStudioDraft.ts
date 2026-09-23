import type { BlockInstance, CmsPage } from '#shared/cms/blocks'
import { seedBlockData, untranslatedFields } from '#shared/cms/blocks'
import { DEFAULT_LOCALE } from '#shared/cms/i18n'

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

function newId() {
  return `blk_${Math.random().toString(36).slice(2, 10)}`
}

/** Deep clone. Block data is plain JSON, which is what makes all of this cheap. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

/**
 * All editor state for one page: the block list, selection, undo/redo, and
 * autosave.
 *
 * Undo is a snapshot stack rather than a command log. Block data is plain JSON
 * and pages are small, so snapshotting is a couple of days of work here and is
 * genuinely expensive to retrofit later (§8.6). Merchants press Cmd+Z; a CMS
 * that does not answer feels broken regardless of what else it does.
 */
export function useStudioDraft(page: Ref<CmsPage>) {
  const blocks = ref<BlockInstance[]>(clone(page.value.draft))
  const selectedId = ref<string | null>(null)

  /** Which language the editor is currently writing. */
  const locale = ref<string>(DEFAULT_LOCALE)

  const undoStack = ref<string[]>([])
  const redoStack = ref<string[]>([])
  const MAX_HISTORY = 60

  const saveState = ref<SaveState>('idle')
  const issues = ref<{ path: string, message: string }[]>([])
  const lastSavedAt = ref<string | null>(null)

  const selected = computed(() =>
    blocks.value.find(block => block.id === selectedId.value) ?? null)

  const canUndo = computed(() => undoStack.value.length > 0)
  const canRedo = computed(() => redoStack.value.length > 0)

  /** Outstanding translation work in the current language, per block and total. */
  const untranslatedByBlock = computed<Record<string, number>>(() =>
    Object.fromEntries(blocks.value.map(block =>
      [block.id, untranslatedFields(block.blockType, block.data, locale.value)])))

  const untranslatedTotal = computed(() =>
    Object.values(untranslatedByBlock.value).reduce((sum, n) => sum + n, 0))

  /** Call BEFORE mutating. Every mutation below goes through it. */
  function snapshot() {
    undoStack.value.push(JSON.stringify(blocks.value))
    if (undoStack.value.length > MAX_HISTORY) undoStack.value.shift()
    // Any new edit invalidates the redo branch — standard editor behaviour.
    redoStack.value = []
    saveState.value = 'dirty'
    scheduleSave()
  }

  function restore(json: string) {
    blocks.value = JSON.parse(json)
    // Selection may point at a block that no longer exists after an undo.
    if (!blocks.value.some(block => block.id === selectedId.value)) {
      selectedId.value = null
    }
    saveState.value = 'dirty'
    scheduleSave()
  }

  function undo() {
    const previous = undoStack.value.pop()
    if (previous === undefined) return
    redoStack.value.push(JSON.stringify(blocks.value))
    restore(previous)
  }

  function redo() {
    const next = redoStack.value.pop()
    if (next === undefined) return
    undoStack.value.push(JSON.stringify(blocks.value))
    restore(next)
  }

  // --- mutations ------------------------------------------------------------

  function insertBlock(blockType: string, index: number) {
    snapshot()
    const block: BlockInstance = {
      id: newId(),
      blockType,
      data: seedBlockData(blockType),
    }
    blocks.value.splice(index, 0, block)
    // Select it and open the inspector: the merchant's next action is always
    // to type into it.
    selectedId.value = block.id
    return block
  }

  function moveBlock(fromIndex: number, toIndex: number) {
    // `toIndex` is an insertion index in the PRE-removal list, so it may
    // legitimately equal blocks.length. Anything outside that is a no-op rather
    // than a negative splice, which would silently move the block to the wrong
    // end of the page.
    if (fromIndex < 0 || fromIndex >= blocks.value.length) return
    if (toIndex < 0 || toIndex > blocks.value.length) return
    if (fromIndex === toIndex) return
    snapshot()
    const next = [...blocks.value]
    const [moved] = next.splice(fromIndex, 1)
    // Removing the dragged block shifts everything after it down by one.
    next.splice(fromIndex < toIndex ? toIndex - 1 : toIndex, 0, moved!)
    blocks.value = next
  }

  function removeBlock(id: string) {
    snapshot()
    blocks.value = blocks.value.filter(block => block.id !== id)
    if (selectedId.value === id) selectedId.value = null
  }

  function duplicateBlock(id: string) {
    const index = blocks.value.findIndex(block => block.id === id)
    if (index === -1) return
    snapshot()
    const copy: BlockInstance = { ...clone(blocks.value[index]!), id: newId() }
    blocks.value.splice(index + 1, 0, copy)
    selectedId.value = copy.id
  }

  function updateField(name: string, value: unknown) {
    const block = selected.value
    if (!block) return
    snapshot()
    block.data = { ...block.data, [name]: value }
  }

  // --- autosave -------------------------------------------------------------
  // Typing in the inspector updates the canvas instantly (that is just Vue
  // reactivity over the real component). Persistence is debounced so a headline
  // being typed is one write, not thirty.

  let timer: ReturnType<typeof setTimeout> | null = null

  function scheduleSave() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => void save(), 900)
  }

  async function save() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    saveState.value = 'saving'

    try {
      const response = await $fetch<{ issues: typeof issues.value }>(
        `/api/cms/pages/${page.value.id}/draft`,
        { method: 'PUT', body: { blocks: blocks.value } },
      )
      // The server is the authority on what is valid; it returns the issues so
      // the studio can surface them rather than guessing.
      issues.value = response.issues
      saveState.value = 'saved'
      lastSavedAt.value = new Date().toISOString()
    }
    catch (error) {
      console.error('[studio] draft save failed', error)
      saveState.value = 'error'
    }
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    blocks,
    selectedId,
    selected,
    locale,
    untranslatedByBlock,
    untranslatedTotal,
    issues,
    saveState,
    lastSavedAt,
    canUndo,
    canRedo,
    undo,
    redo,
    snapshot,
    insertBlock,
    moveBlock,
    removeBlock,
    duplicateBlock,
    updateField,
    save,
  }
}
