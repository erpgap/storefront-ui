<script setup lang="ts">
// The studio canvas.
//
// Layout is Option A from §8.4: the canvas spans the full viewport and the
// palette and inspector are overlay drawers. This is not cosmetic. The
// storefront components size themselves with viewport units —
// `clamp(40px,6vw,80px)` for the hero headline, `clamp(64px,9vw,132px)` for
// section padding. In a canvas squeezed into a centre column, `6vw` still
// resolves against the WINDOW, so every font size and gutter renders wrong and
// the editor stops showing the truth. Full-width keeps the canvas honest, and
// costs roughly two weeks less than the iframe alternative.
import type { CmsPage } from '#shared/cms/blocks'
import { CMS_LOCALES, DEFAULT_LOCALE } from '#shared/cms/i18n'
import { blockRegistry } from '~~/layers/cms/blocks'
import { useStudioDraft } from '../../composables/useStudioDraft'

definePageMeta({ layout: false })

const route = useRoute()
const pageId = computed(() => String(route.params.id))

const { data: page } = await useFetch<CmsPage>(`/api/cms/pages/${pageId.value}`, {
  key: `studio-page-${pageId.value}`,
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useHead({ title: `${page.value.title} — Studio` })

const draft = useStudioDraft(page as Ref<CmsPage>)
const {
  blocks, selectedId, selected, issues, saveState,
  locale, untranslatedTotal,
  canUndo, canRedo, undo, redo,
  insertBlock, moveBlock, removeBlock, duplicateBlock, updateField, save,
} = draft

const paletteOpen = ref(true)

/**
 * The position a new block will land at when the merchant picks from the
 * palette. Clicking an "+ Add block here" strip on the canvas arms it; the
 * palette then says where the block is going.
 *
 * This exists because choosing the POSITION must not depend on drag-and-drop
 * working. HTML5 drag is unreliable across browsers, impossible on touch and
 * unusable by keyboard — so every drag interaction here has a click equivalent.
 */
const insertAt = ref<number | null>(null)

function armInsertPoint(index: number) {
  insertAt.value = index
  paletteOpen.value = true
}

function insertFromPalette(blockType: string) {
  const index = insertAt.value ?? blocks.value.length
  insertBlock(blockType, index)
  insertAt.value = null
}

// Option A's one real cost: the drawers overlay the page (§8.4). With both open
// the hero's copy — which sits in the left half — disappears behind the
// palette. Selecting a block closes the palette, so the merchant never has two
// panels covering the thing they are editing. It is one click away in the top
// bar, and reopening it does not clear the selection.
watch(selectedId, (id) => {
  if (id) paletteOpen.value = false
})

const selectedSchema = computed(() =>
  selected.value
    ? blockRegistry.find(definition => definition.name === selected.value!.blockType)
    : undefined)

// Server issues arrive as a flat list of paths like `blocks[2].ctas[0].label`.
// The inspector addresses fields by their path WITHIN the selected block, so
// rebase them onto the selected block's index.
const selectedIssues = computed<Record<string, string>>(() => {
  const index = blocks.value.findIndex(block => block.id === selectedId.value)
  if (index === -1) return {}

  const prefix = `blocks[${index}].`
  return Object.fromEntries(
    issues.value
      .filter(item => item.path.startsWith(prefix))
      .map(item => [item.path.slice(prefix.length), item.message]),
  )
})

const blocksWithIssues = computed(() => {
  const indexes = new Set<number>()
  for (const item of issues.value) {
    const match = /^blocks\[(\d+)\]/.exec(item.path)
    if (match) indexes.add(Number(match[1]))
  }
  return indexes
})

// --- publish ----------------------------------------------------------------

const publishing = ref(false)
const publishError = ref('')

const isPublished = computed(() => page.value?.published ?? false)

async function publish() {
  publishing.value = true
  publishError.value = ''

  try {
    // Flush the debounce first: publishing what is on screen, not what was
    // saved 900ms ago, is the whole point of the button.
    await save()
    const updated = await $fetch<CmsPage>(`/api/cms/pages/${pageId.value}/publish`, {
      method: 'POST',
    })
    page.value = updated
  }
  catch (error: any) {
    publishError.value = error?.data?.statusMessage
      || error?.statusMessage
      || 'Could not publish this page.'
  }
  finally {
    publishing.value = false
  }
}

async function discard() {
  if (!confirm('Discard all unpublished changes and go back to the live version?')) return
  const updated = await $fetch<CmsPage>(`/api/cms/pages/${pageId.value}/discard`, {
    method: 'POST',
  })
  page.value = updated
  blocks.value = JSON.parse(JSON.stringify(updated.draft))
  selectedId.value = null
}

// --- drag and drop (§8.3) ---------------------------------------------------
// Native HTML5 drag events, no library. That is affordable ONLY because
// CmsBlockShell's overlay turned the canvas into a flat list of uniform
// rectangles — the geometry below never has to reason about what is inside a
// block, only where it sits.

const canvas = ref<HTMLElement | null>(null)
const dropIndex = ref<number | null>(null)
const dragging = ref<
  | { kind: 'new', blockType: string }
  | { kind: 'move', id: string }
  | null
>(null)

/**
 * Maps a pointer position to an insertion index. Only block bounding boxes are
 * consulted — which is exactly what CmsBlockShell's overlay bought us: the
 * geometry never has to reason about what is inside a block, only where it sits.
 */
function dropTargetFromPointer(clientY: number): number {
  const container = canvas.value
  if (!container) return 0

  const shells = Array.from(container.querySelectorAll('[data-cms-block-index]'))

  for (let i = 0; i < shells.length; i++) {
    const rect = shells[i]!.getBoundingClientRect()
    // Above the midpoint means "insert before this block".
    if (clientY < rect.top + rect.height / 2) return i
  }

  return shells.length
}

function onCanvasDragOver(event: DragEvent) {
  if (!dragging.value) return
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = dragging.value.kind === 'new' ? 'copy' : 'move'
  }

  dropIndex.value = dropTargetFromPointer(event.clientY)

  autoScroll(event.clientY)
}

/**
 * The canvas is a scroll container and HTML5 drag does not scroll it reliably,
 * so a long page has positions you simply cannot drop at. Nudge it when the
 * pointer is near an edge.
 */
function autoScroll(clientY: number) {
  const container = canvas.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  const zone = 80

  if (clientY < rect.top + zone) {
    container.scrollBy({ top: -18 })
  }
  else if (clientY > rect.bottom - zone) {
    container.scrollBy({ top: 18 })
  }
}

function onCanvasDrop(event: DragEvent) {
  if (!dragging.value || dropIndex.value === null) return resetDrag()
  event.preventDefault()

  const target = dropIndex.value

  if (dragging.value.kind === 'new') {
    insertBlock(dragging.value.blockType, target)
  }
  else {
    const from = blocks.value.findIndex(block => block.id === (dragging.value as { id: string }).id)
    if (from !== -1) moveBlock(from, target)
  }

  resetDrag()
}

function resetDrag() {
  dragging.value = null
  dropIndex.value = null
}

/**
 * Firefox will not begin a drag unless dragstart puts something on the
 * dataTransfer, and Safari is inconsistent without it. Chrome is forgiving,
 * which is exactly why this is easy to miss.
 */
function onPaletteDragStart(event: DragEvent, blockType: string) {
  dragging.value = { kind: 'new', blockType }
  event.dataTransfer?.setData('text/plain', `cms-block:${blockType}`)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy'
}

function onCanvasDragStart(event: DragEvent) {
  // Only the toolbar handle starts a move; dragging the block body would fight
  // with text selection and image drag.
  const handle = (event.target as HTMLElement)?.closest?.('[data-cms-drag-handle]')
  if (!handle) return

  const shell = handle.closest('[data-cms-block-index]')
  const id = shell?.getAttribute('data-cms-block-id')
  if (!id) return

  dragging.value = { kind: 'move', id }
  event.dataTransfer?.setData('text/plain', `cms-move:${id}`)
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

// --- keyboard ---------------------------------------------------------------

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? '')

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
    // Inside a text field, let the browser's own undo win — stealing Cmd+Z
    // while someone is typing a headline is worse than not having it.
    if (typing) return
    event.preventDefault()
    event.shiftKey ? redo() : undo()
    return
  }

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void save()
    return
  }

  if (event.key === 'Escape') selectedId.value = null

  if ((event.key === 'Delete' || event.key === 'Backspace') && !typing && selectedId.value) {
    event.preventDefault()
    removeBlock(selectedId.value)
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const saveLabel = computed(() => ({
  idle: 'All changes saved',
  dirty: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Draft saved',
  error: 'Could not save',
}[saveState.value]))
</script>

<template>
  <div class="h-screen flex flex-col bg-white text-black overflow-hidden">
    <!-- Top bar -->
    <header class="flex-none flex items-center gap-3 px-4 h-14 border-b border-primary-200 bg-white z-20">
      <NuxtLink
        to="/studio"
        class="text-[13px] text-primary-500 hover:text-black whitespace-nowrap"
      >
        ← Pages
      </NuxtLink>

      <span class="w-px h-5 bg-primary-200" />

      <button
        type="button"
        class="studio-btn"
        :aria-pressed="paletteOpen"
        @click="paletteOpen = !paletteOpen"
      >
        {{ paletteOpen ? 'Hide blocks' : 'Add blocks' }}
      </button>

      <div class="min-w-0">
        <p class="text-[13px] font-medium truncate">
          {{ page!.title }}
        </p>
        <p class="text-[11px] text-primary-400 truncate">
          {{ page!.slug }}
        </p>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <!-- The whole of multi-language editing, from the merchant's side:
             one dropdown. The per-language storage shape never surfaces. -->
        <label class="flex items-center gap-1.5">
          <span class="sr-only">Content language</span>
          <select
            v-model="locale"
            class="studio-btn !normal-case !tracking-normal py-1.5"
            :class="locale !== DEFAULT_LOCALE ? '!border-amber-500 !text-amber-700' : ''"
          >
            <option
              v-for="option in CMS_LOCALES"
              :key="option.code"
              :value="option.code"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <span
          v-if="locale !== DEFAULT_LOCALE"
          class="text-[11px] whitespace-nowrap"
          :class="untranslatedTotal ? 'text-amber-700' : 'text-green-700'"
          role="status"
        >
          {{ untranslatedTotal
            ? `${untranslatedTotal} field${untranslatedTotal === 1 ? '' : 's'} to translate`
            : 'Fully translated' }}
        </span>

        <span
          class="text-[11px] whitespace-nowrap"
          :class="saveState === 'error' ? 'text-red-600' : 'text-primary-400'"
          role="status"
        >
          {{ saveLabel }}
        </span>

        <button
          type="button"
          class="studio-btn"
          :disabled="!canUndo"
          title="Undo (Cmd+Z)"
          @click="undo"
        >
          Undo
        </button>
        <button
          type="button"
          class="studio-btn"
          :disabled="!canRedo"
          title="Redo (Cmd+Shift+Z)"
          @click="redo"
        >
          Redo
        </button>

        <button
          type="button"
          class="studio-btn"
          @click="discard"
        >
          Discard
        </button>

        <a
          v-if="isPublished"
          :href="locale === DEFAULT_LOCALE ? page!.slug : `${page!.slug}?lang=${locale}`"
          target="_blank"
          rel="noopener"
          class="studio-btn"
        >
          View live ↗
        </a>

        <button
          type="button"
          class="studio-btn studio-btn--primary"
          :disabled="publishing"
          @click="publish"
        >
          {{ publishing ? 'Publishing…' : isPublished ? 'Publish changes' : 'Publish' }}
        </button>
      </div>
    </header>

    <p
      v-if="publishError"
      class="flex-none px-4 py-2 bg-red-50 text-red-700 text-[12px] border-b border-red-200"
      role="alert"
    >
      {{ publishError }}
    </p>

    <div class="flex-1 relative min-h-0">
      <!-- Canvas: full viewport width, so vw-based type and spacing in the real
           components resolve exactly as they will in production. -->
      <main
        ref="canvas"
        class="absolute inset-0 overflow-y-auto"
        :style="{
          // Drives where CmsBlockShell parks its toolbar and badge, so an open
          // drawer never covers a block's drag handle. w-80 = 20rem, w-56 = 14rem.
          '--cms-inspector-w': selected ? '20rem' : '0px',
          '--cms-palette-w': paletteOpen ? '14rem' : '0px',
        }"
        @dragover="onCanvasDragOver"
        @drop="onCanvasDrop"
        @dragstart="onCanvasDragStart"
        @dragend="resetDrag"
      >
        <BlockRenderer
          :blocks="blocks"
          mode="edit"
          :selected-id="selectedId"
          :insert-at="insertAt"
          :drop-index="dropIndex"
          :locale="locale"
          @select="selectedId = $event"
          @remove="removeBlock"
          @duplicate="duplicateBlock"
          @insert="armInsertPoint"
          @move="moveBlock($event.from, $event.to)"
        />

        <div
          v-if="!blocks.length"
          class="py-32 text-center"
          :class="dropIndex !== null ? 'bg-blue-50' : ''"
        >
          <p class="text-[13px] tracking-[0.12em] uppercase text-primary-400">
            Drag a block here — or just click one in the list
          </p>
        </div>

        <!-- While dragging, the insert point at `dropIndex` lights up, so the
             indicator is the same element the merchant can also just click. -->
      </main>

      <!-- Palette drawer -->
      <aside
        v-if="paletteOpen"
        class="absolute top-0 left-0 bottom-0 w-56 bg-white/95 backdrop-blur border-r border-primary-200 p-3 overflow-y-auto z-10 shadow-lg"
        aria-label="Blocks"
      >
        <p
          v-if="insertAt !== null"
          class="text-[11px] tracking-[0.14em] uppercase text-blue-700 bg-blue-50 rounded px-2 py-1.5 mb-2 flex items-center justify-between gap-2"
        >
          Inserting at {{ insertAt + 1 }}
          <button
            type="button"
            class="text-blue-700/70 hover:text-blue-900 normal-case tracking-normal"
            @click="insertAt = null"
          >
            cancel
          </button>
        </p>
        <p
          v-else
          class="text-[11px] tracking-[0.14em] uppercase text-primary-400 mb-2"
        >
          Drag onto the page
        </p>
        <div class="flex flex-col gap-2">
          <button
            v-for="definition in blockRegistry"
            :key="definition.name"
            type="button"
            draggable="true"
            class="text-left rounded-md border border-primary-200 p-2.5 cursor-grab hover:border-primary-400 hover:bg-primary-50 transition-colors"
            @dragstart="onPaletteDragStart($event, definition.name)"
            @dragend="resetDrag"
            @click="insertFromPalette(definition.name)"
          >
            <span class="block text-[13px] font-medium">{{ definition.label }}</span>
            <span class="block text-[11px] text-primary-400 leading-snug mt-0.5">
              {{ definition.description }}
            </span>
          </button>
        </div>
        <p class="text-[11px] text-primary-400 mt-3 leading-snug">
          {{ insertAt !== null
            ? `Click a block to insert it at position ${insertAt + 1}.`
            : 'Or click a block to add it at the end. To choose the exact position without dragging, hover between two blocks on the page and click “Add block here”.' }}
        </p>
      </aside>

      <!-- Inspector drawer -->
      <aside
        v-if="selected && selectedSchema"
        class="absolute top-0 right-0 bottom-0 w-80 bg-white/95 backdrop-blur border-l border-primary-200 overflow-y-auto z-10 shadow-lg"
        aria-label="Block settings"
      >
        <div class="sticky top-0 bg-white/95 backdrop-blur flex items-center justify-between px-4 h-12 border-b border-primary-200">
          <p class="text-[11px] tracking-[0.14em] uppercase text-primary-500">
            {{ selectedSchema.label }}
          </p>
          <button
            type="button"
            class="text-primary-400 hover:text-black"
            aria-label="Close settings"
            @click="selectedId = null"
          >
            ✕
          </button>
        </div>

        <div class="p-4 flex flex-col gap-4">
          <!-- Said once, here, instead of a lock message on every hidden field. -->
          <p
            v-if="locale !== DEFAULT_LOCALE"
            class="text-[11px] text-amber-800 bg-amber-50 rounded p-2.5 leading-snug"
          >
            Translating {{ CMS_LOCALES.find(l => l.code === locale)?.label }}.
            Only text and images appear here — layout and settings are shared
            across languages and are edited in English.
          </p>

          <p
            v-if="selectedSchema.dynamic"
            class="text-[11px] text-primary-500 bg-primary-50 rounded p-2.5 leading-snug"
          >
            Products come live from your catalogue in Odoo. You control the
            wording and how many are shown — not the products themselves.
          </p>

          <StudioFieldControl
            v-for="field in selectedSchema.fields"
            :key="field.name"
            :field="field"
            :model-value="selected.data[field.name]"
            :issues="selectedIssues"
            :locale="locale"
            @update:model-value="value => updateField(field.name, value)"
          />
        </div>
      </aside>

      <!-- Validation summary: blocks needing attention before publish. -->
      <div
        v-if="issues.length"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-amber-500 text-white text-[12px] px-4 py-2 shadow-lg"
        role="status"
      >
        {{ blocksWithIssues.size }} block{{ blocksWithIssues.size === 1 ? '' : 's' }}
        need attention before publishing
      </div>
    </div>
  </div>
</template>

<style scoped>
.studio-btn {
  padding: 0.35rem 0.7rem;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid rgb(0 0 0 / 18%);
  border-radius: 0.25rem;
}

.studio-btn:hover:not(:disabled) {
  border-color: rgb(0 0 0 / 45%);
}

.studio-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.studio-btn--primary {
  color: #fff;
  background: #000;
  border-color: #000;
}

.studio-btn--primary:hover:not(:disabled) {
  background: rgb(37 99 235);
  border-color: rgb(37 99 235);
}
</style>
