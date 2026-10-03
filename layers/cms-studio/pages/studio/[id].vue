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
import type { CmsLocale } from '#shared/cms/i18n'
import { blockLabel, blockRegistry } from '~~/layers/cms/blocks'
import { useStudioDraft } from '../../composables/useStudioDraft'

definePageMeta({ layout: false, middleware: 'studio-auth' })

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
const versionsOpen = ref(false)

// Content languages come from the website's active languages in Odoo, not from
// the Nuxt i18n config: a merchant may sell in more languages than the
// storefront interface has been translated into.
const { data: localeData } = await useFetch<{
  locales: CmsLocale[]
  defaultLocale: string
}>('/api/cms/locales', {
  key: 'cms-locales',
  default: () => ({ locales: CMS_LOCALES, defaultLocale: DEFAULT_LOCALE }),
})

const locales = computed(() => localeData.value?.locales ?? CMS_LOCALES)
const defaultLocale = computed(() => localeData.value?.defaultLocale ?? DEFAULT_LOCALE)

async function onRestored() {
  // Reload rather than patching state: restore changes the live revision, the
  // draft and the history all at once, and guessing at the new state is how
  // editors end up looking at something that is not there.
  await refreshNuxtData(`studio-page-${pageId.value}`)
  window.location.reload()
}

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

/**
 * Whether the draft differs from what visitors see.
 *
 * Compared directly rather than read off the page record, which is only
 * accurate at load: the autosave updates the draft without refetching the
 * page, so a flag from the server goes stale the moment anyone types.
 */
const hasUnpublishedChanges = computed(() =>
  JSON.stringify(blocks.value) !== JSON.stringify(page.value?.publishedBlocks ?? []))

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

/**
 * Throws away the draft and goes back to what visitors currently see.
 *
 * Worth being precise about, because the obvious reading - "undo what I did
 * since opening the editor" - is wrong and much smaller than what happens.
 * This discards EVERY unpublished change on the page, including ones made in
 * a previous sitting by someone else. Undo is the per-session tool; this one
 * is a reset.
 */
async function revertToLive() {
  const message = isPublished.value
    ? 'Throw away all unpublished changes and go back to the version visitors '
      + 'see right now?\n\nThis includes changes made earlier or by someone '
      + 'else, not just the ones you have made since opening the editor.'
    : 'This page has never been published, so there is no live version to go '
      + 'back to. Continuing removes every block on it.\n\nContinue?'

  if (!confirm(message)) return

  const updated = await $fetch<CmsPage>(`/api/cms/pages/${pageId.value}/discard`, {
    method: 'POST',
  })
  page.value = updated
  blocks.value = JSON.parse(JSON.stringify(updated.draft))
  selectedId.value = null
}

// --- drag and drop ----------------------------------------------------------
// Pointer Events rather than HTML5 drag.
//
// HTML5 drag has no touch support and never will - it predates the iPhone -
// so a merchant on a tablet could not move a block at all. Pointer Events
// unify mouse, touch and pen into one stream, and setPointerCapture keeps
// the gesture alive when the pointer leaves the element it started on, which
// is the problem that makes naive implementations feel broken.
//
// None of the geometry changed. CmsBlockShell's overlay already reduced the
// canvas to a flat list of uniform rectangles, so the only thing that moved
// is where the coordinates come from.

const canvas = ref<HTMLElement | null>(null)
const dropIndex = ref<number | null>(null)

type DragPayload =
  | { kind: 'new', blockType: string, label: string }
  | { kind: 'move', id: string, label: string }

const dragging = ref<DragPayload | null>(null)
/** Where to paint the floating label that follows the pointer. */
const dragPoint = ref({ x: 0, y: 0 })

/**
 * A press is not a drag until it travels. Without a threshold every click on
 * a palette tile would be a one-pixel drag, and the click handlers that make
 * all of this usable without a pointer would never fire.
 */
const DRAG_THRESHOLD = 6

let origin: { x: number, y: number } | null = null
let pending: DragPayload | null = null
let captured: { element: Element, pointerId: number } | null = null
/** Set when a drag actually happened, so the click that follows is ignored. */
let suppressClick = false

/**
 * Maps a pointer position to an insertion index. Only block bounding boxes
 * are consulted - which is exactly what the overlay bought us: the geometry
 * never has to reason about what is inside a block, only where it sits.
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

/**
 * The canvas is a scroll container, so a long page has positions the pointer
 * cannot otherwise reach. Nudge it near the edges.
 */
function autoScroll(clientY: number) {
  const container = canvas.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  const zone = 80

  if (clientY < rect.top + zone) container.scrollBy({ top: -18 })
  else if (clientY > rect.bottom - zone) container.scrollBy({ top: 18 })
}

function beginDrag(event: PointerEvent, payload: DragPayload) {
  // Secondary buttons and right-clicks are not drags.
  if (event.button !== 0) return

  origin = { x: event.clientX, y: event.clientY }
  pending = payload
  dragPoint.value = { x: event.clientX, y: event.clientY }

  const element = event.currentTarget as Element
  try {
    element.setPointerCapture(event.pointerId)
    captured = { element, pointerId: event.pointerId }
  }
  catch {
    // Capture can be refused; the window listeners below still work.
    captured = null
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', cancelDrag)
}

function onPointerMove(event: PointerEvent) {
  if (!origin) return

  dragPoint.value = { x: event.clientX, y: event.clientY }

  if (!dragging.value) {
    const travelled = Math.hypot(event.clientX - origin.x, event.clientY - origin.y)
    if (travelled < DRAG_THRESHOLD) return
    dragging.value = pending
    // Stops the browser treating the gesture as a scroll or a text selection
    // once it is clearly a drag.
    document.body.style.userSelect = 'none'
  }

  // Touch would otherwise scroll the page out from under the drag.
  if (event.cancelable) event.preventDefault()

  dropIndex.value = dropTargetFromPointer(event.clientY)
  autoScroll(event.clientY)
}

function onPointerUp() {
  const payload = dragging.value
  const target = dropIndex.value

  if (payload && target !== null) {
    if (payload.kind === 'new') {
      insertBlock(payload.blockType, target)
    }
    else {
      const from = blocks.value.findIndex(block => block.id === payload.id)
      if (from !== -1) moveBlock(from, target)
    }
    // The browser fires click after pointerup; without this, dropping a tile
    // would also run the tile's click handler and add a second block.
    suppressClick = true
  }

  cancelDrag()
}

function cancelDrag() {
  if (captured) {
    try {
      captured.element.releasePointerCapture(captured.pointerId)
    }
    catch { /* already released */ }
    captured = null
  }

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', cancelDrag)

  document.body.style.userSelect = ''
  origin = null
  pending = null
  dragging.value = null
  dropIndex.value = null
}

/** Starts a drag from a palette tile. */
function onPaletteDragStart(event: PointerEvent, blockType: string, label: string) {
  beginDrag(event, { kind: 'new', blockType, label })
}

/** Starts a drag from a block's ⋮⋮ handle. */
function onCanvasDragStart(event: PointerEvent) {
  const handle = (event.target as HTMLElement)?.closest?.('[data-cms-drag-handle]')
  if (!handle) return

  const shell = handle.closest('[data-cms-block-index]')
  const id = shell?.getAttribute('data-cms-block-id')
  if (!id) return

  const label = blockLabel(
    blocks.value.find(block => block.id === id)?.blockType ?? '',
  )
  beginDrag(event, { kind: 'move', id, label })
}

/** Swallows the click that follows a completed drag. */
function onPaletteClick(blockType: string) {
  if (suppressClick) {
    suppressClick = false
    return
  }
  insertFromPalette(blockType)
}

onBeforeUnmount(cancelDrag)

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
    <header class="studio-chrome flex-none flex items-center gap-3 px-4 h-14 border-b border-white/10 z-20">
      <NuxtLink
        to="/studio"
        class="text-[13px] text-white/60 hover:text-white whitespace-nowrap"
      >
        ← Pages
      </NuxtLink>

      <span class="w-px h-5 bg-white/15" />

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
        <p class="text-[11px] text-white/45 truncate">
          {{ (page as any)!.kind === 'region'
            ? 'Appears inside storefront pages'
            : page!.slug }}
        </p>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <!-- The whole of multi-language editing, from the merchant's side:
             one dropdown. The per-language storage shape never surfaces. -->
        <label
          v-if="locales.length > 1"
          class="flex items-center gap-1.5"
        >
          <span class="sr-only">Content language</span>
          <select
            v-model="locale"
            class="studio-btn !normal-case !tracking-normal py-1.5"
            :class="locale !== defaultLocale ? '!border-amber-500 !text-amber-700' : ''"
          >
            <option
              v-for="option in locales"
              :key="option.code"
              :value="option.code"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <span
          v-if="locale !== defaultLocale"
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
          :class="saveState === 'error' ? 'text-red-400' : 'text-white/50'"
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
          @click="versionsOpen = true"
        >
          History
        </button>

        <button
          type="button"
          class="studio-btn studio-btn--danger"
          :disabled="!hasUnpublishedChanges"
          :title="isPublished
            ? 'Throw away all unpublished changes and go back to the live version'
            : 'Remove every block on this page'"
          @click="revertToLive"
        >
          {{ isPublished ? 'Revert to live' : 'Clear page' }}
        </button>

        <a
          v-if="isPublished && (page as any)!.kind !== 'region'"
          :href="locale === defaultLocale ? page!.slug : `${page!.slug}?lang=${locale}`"
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
        @pointerdown="onCanvasDragStart"
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

        <!-- Pointer Events provide no drag image, so the thing being dragged
           needs to be visible somewhere. A small label beats a clone of a
           full-bleed section following the cursor around. -->
      <div
        v-if="dragging"
        class="pointer-events-none fixed z-[200] px-2.5 py-1.5 rounded-md bg-neutral-900 text-white text-[11px] tracking-[0.1em] uppercase shadow-lg"
        :style="{ left: `${dragPoint.x + 14}px`, top: `${dragPoint.y + 14}px` }"
      >
        {{ dragging.label }}
      </div>

      <!-- While dragging, the insert point at `dropIndex` lights up, so the
             indicator is the same element the merchant can also just click. -->
      </main>

      <!-- Palette drawer -->
      <aside
        v-if="paletteOpen"
        class="studio-chrome absolute top-0 left-0 bottom-0 w-56 border-r border-white/10 p-3 overflow-y-auto z-10 shadow-xl"
        aria-label="Blocks"
      >
        <p
          v-if="insertAt !== null"
          class="text-[11px] tracking-[0.14em] uppercase text-blue-200 bg-blue-500/20 rounded px-2 py-1.5 mb-2 flex items-center justify-between gap-2"
        >
          Inserting at {{ insertAt + 1 }}
          <button
            type="button"
            class="text-blue-200/75 hover:text-white normal-case tracking-normal"
            @click="insertAt = null"
          >
            cancel
          </button>
        </p>
        <p
          v-else
          class="text-[11px] tracking-[0.14em] uppercase text-white/40 mb-2"
        >
          Drag onto the page
        </p>
        <div class="flex flex-col gap-2">
          <button
            v-for="definition in blockRegistry"
            :key="definition.name"
            type="button"
            class="text-left rounded-md border border-white/15 bg-white/[0.06] p-2.5 cursor-grab hover:border-white/40 hover:bg-white/[0.12] transition-colors touch-none"
            @pointerdown="onPaletteDragStart($event, definition.name, definition.label)"
            @click="onPaletteClick(definition.name)"
          >
            <span class="block text-[13px] font-medium">{{ definition.label }}</span>
            <span class="block text-[11px] text-white/50 leading-snug mt-0.5">
              {{ definition.description }}
            </span>
          </button>
        </div>
        <p class="text-[11px] text-white/40 mt-3 leading-snug">
          {{ insertAt !== null
            ? `Click a block to insert it at position ${insertAt + 1}.`
            : 'Or click a block to add it at the end. To choose the exact position without dragging, hover between two blocks on the page and click “Add block here”.' }}
        </p>
      </aside>

      <!-- Inspector drawer -->
      <aside
        v-if="selected && selectedSchema"
        class="studio-chrome absolute top-0 right-0 bottom-0 w-80 border-l border-white/10 overflow-y-auto z-10 shadow-xl"
        aria-label="Block settings"
      >
        <div class="studio-chrome sticky top-0 flex items-center justify-between px-4 h-12 border-b border-white/10">
          <p class="text-[11px] tracking-[0.14em] uppercase text-white/60">
            {{ selectedSchema.label }}
          </p>
          <button
            type="button"
            class="text-white/50 hover:text-white"
            aria-label="Close settings"
            @click="selectedId = null"
          >
            ✕
          </button>
        </div>

        <div class="p-4 flex flex-col gap-4">
          <!-- Said once, here, instead of a lock message on every hidden field. -->
          <p
            v-if="locale !== defaultLocale"
            class="text-[11px] text-amber-200 bg-amber-400/15 rounded p-2.5 leading-snug"
          >
            Translating {{ locales.find(l => l.code === locale)?.label }}.
            Only text and images appear here — layout and settings are shared
            across languages and are edited in English.
          </p>

          <p
            v-if="selectedSchema.dynamic"
            class="text-[11px] text-white/60 bg-white/[0.06] rounded p-2.5 leading-snug"
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

      <StudioVersions
        v-if="versionsOpen"
        :page-id="pageId"
        :has-unpublished-changes="saveState === 'dirty' || saveState === 'saving'"
        @restored="onRestored"
        @close="versionsOpen = false"
      />

      <!-- Validation summary: blocks needing attention before publish. -->
      <div
        v-if="issues.length"
        class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 rounded-full bg-amber-500 text-white text-[12px] px-4 py-2 shadow-lg"
        role="status"
      >
        {{ blocksWithIssues.size }}
        {{ blocksWithIssues.size === 1 ? 'block needs' : 'blocks need' }}
        attention before publishing
      </div>
    </div>
  </div>
</template>

<style scoped>
/* One surface for every piece of editor chrome - top bar and both rails.
   When the tools and the page share a colour you lose the boundary between
   editing the page and looking at it, which is the whole problem this solves.
   The canvas stays white and full-bleed so it reads as the page itself. */
.studio-chrome {
  color: #fff;
  background: rgb(23 23 23 / 97%);
  backdrop-filter: blur(6px);
}

.studio-btn {
  padding: 0.35rem 0.7rem;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  border: 1px solid rgb(255 255 255 / 22%);
  border-radius: 0.25rem;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}

/* A visible fill on hover, not just a darker outline - a border going from
   18% to 45% black is close to invisible against a white row. */
.studio-btn:hover:not(:disabled) {
  background: rgb(255 255 255 / 12%);
  border-color: rgb(255 255 255 / 50%);
}

.studio-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.studio-btn--primary {
  color: #000;
  background: #fff;
  border-color: #fff;
}

/* Lifts to charcoal rather than turning blue. The blue read as a different
   button appearing under the cursor rather than the same one responding. */
.studio-btn--primary:hover:not(:disabled) {
  background: rgb(255 255 255 / 82%);
  border-color: rgb(255 255 255 / 82%);
}

/* Destructive actions carry their colour in the border too, so the risk is
   legible before the pointer reaches them. */
.studio-btn--danger {
  color: rgb(248 113 113);
  border-color: rgb(248 113 113 / 45%);
}

.studio-btn--danger:hover:not(:disabled) {
  color: #fff;
  background: rgb(220 38 38 / 25%);
  border-color: rgb(248 113 113);
}

@media (prefers-reduced-motion: reduce) {
  .studio-btn {
    transition: none;
  }
}
</style>
