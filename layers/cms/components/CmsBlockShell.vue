<script setup lang="ts">
// The overlay technique — the thing that makes canvas drag-and-drop tractable.
// See docs/CMS_ARCHITECTURE.md §8.2.
//
// The problem: real storefront sections are arbitrary-height and full of links,
// buttons and sliders that swallow pointer events. Selecting and dragging
// directly on them is miserable, and every fix that reaches INTO the component
// (disabling its links, intercepting its handlers) means the canvas stops being
// the real page.
//
// The fix: a transparent overlay absorbs every pointer event and the real
// component underneath is made inert. The drag layer then only ever deals with
// a flat list of uniform rectangles — the easy, well-supported case.
import { blockLabel } from '../blocks'
import type { BlockInstance } from '#shared/cms/blocks'

const props = defineProps<{
  block: BlockInstance
  index: number
  total: number
  selected: boolean
}>()

defineEmits<{ select: [], remove: [], duplicate: [], moveUp: [], moveDown: [] }>()

const label = computed(() => blockLabel(props.block.blockType))

/**
 * A block whose component renders nothing collapses to zero height, and then
 * it cannot be seen, selected, moved or deleted - only found by sweeping the
 * cursor along a hairline. Several blocks render nothing legitimately: a
 * product grid with no matches, a text section before any text is typed.
 *
 * So the shell measures its own content and stands in for it when there is
 * none. Measured rather than inferred from the data, because the shell has no
 * idea what any given component considers "empty".
 */
const body = ref<HTMLElement | null>(null)
const isEmpty = ref(false)

const MIN_VISIBLE_HEIGHT = 24

onMounted(() => {
  if (!body.value) return

  const measure = () => {
    const height = body.value?.getBoundingClientRect().height ?? 0
    isEmpty.value = height < MIN_VISIBLE_HEIGHT
  }

  measure()

  // Content arrives late - async components, images, product queries - so one
  // measurement at mount would mark half the canvas empty.
  const observer = new ResizeObserver(measure)
  observer.observe(body.value)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <div
    class="cms-block group relative"
    :class="selected ? 'cms-block--selected' : undefined"
    :data-cms-block-index="index"
    :data-cms-block-id="block.id"
  >
    <!-- The real component, made inert by the .cms-block__body rule below.
         Nothing reaches into the component itself. -->
    <div
      ref="body"
      class="cms-block__body"
    >
      <slot />
    </div>

    <!-- Stands in when the component renders nothing, so the block stays
         visible and usable. -->
    <div
      v-if="isEmpty"
      class="cms-block__empty"
    >
      <span>{{ label }}</span>
      <span class="cms-block__empty-hint">nothing to show yet — select it to add content</span>
    </div>

    <!-- Everything interactive lives above the content. -->
    <button
      type="button"
      class="cms-block__overlay"
      :aria-label="`Select ${label} block`"
      @click="$emit('select')"
    />

    <div
      class="cms-block__toolbar"
      :class="selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'"
    >
      <!-- touch-action:none via the class, so a drag on a touch screen is a
           drag rather than a page scroll. -->
      <span
        class="cms-block__handle"
        :title="`Drag to move ${label}`"
        data-cms-drag-handle
        aria-hidden="true"
      >⋮⋮</span>

      <span class="text-[11px] tracking-[0.14em] uppercase whitespace-nowrap">{{ label }}</span>

      <span class="cms-block__divider" />

      <!-- Reordering without dragging. Works on touch, works by keyboard, and
           works in the browsers where HTML5 drag is unreliable. -->
      <button
        type="button"
        class="cms-block__action"
        :disabled="index === 0"
        :aria-label="`Move ${label} up`"
        title="Move up"
        @click.stop="$emit('moveUp')"
      >
        ↑
      </button>
      <button
        type="button"
        class="cms-block__action"
        :disabled="index === total - 1"
        :aria-label="`Move ${label} down`"
        title="Move down"
        @click.stop="$emit('moveDown')"
      >
        ↓
      </button>

      <span class="cms-block__divider" />

      <button
        type="button"
        class="cms-block__action"
        :aria-label="`Duplicate ${label} block`"
        title="Duplicate"
        @click.stop="$emit('duplicate')"
      >
        ⧉
      </button>
      <button
        type="button"
        class="cms-block__action"
        :aria-label="`Delete ${label} block`"
        title="Delete"
        @click.stop="$emit('remove')"
      >
        ✕
      </button>
    </div>

    <span
      v-if="selected"
      class="cms-block__badge"
    >
      {{ index + 1 }} / {{ total }}
    </span>
  </div>
</template>

<style scoped>
.cms-block__body {
  /* Links, buttons and sliders inside the real component must not react. */
  pointer-events: none;
  user-select: none;
}

.cms-block__empty {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  align-items: center;
  justify-content: center;
  min-height: 112px;
  padding: 1.5rem;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(0 0 0 / 45%);
  background: repeating-linear-gradient(
    45deg,
    rgb(0 0 0 / 2%),
    rgb(0 0 0 / 2%) 10px,
    transparent 10px,
    transparent 20px
  );
  border: 1px dashed rgb(0 0 0 / 18%);
}

.cms-block__empty-hint {
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: none;
  color: rgb(0 0 0 / 35%);
}

.cms-block__overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  cursor: pointer;
  background: transparent;
  border: 0;
  /* Above the content, below the toolbar. */
  z-index: 1;
}

.cms-block--selected .cms-block__overlay,
.cms-block:hover .cms-block__overlay {
  outline: 2px solid rgb(37 99 235 / 90%);
  outline-offset: -2px;
}

.cms-block--selected .cms-block__overlay {
  outline-width: 3px;
}

.cms-block__toolbar {
  position: absolute;
  top: 0.5rem;
  /* The inspector is an overlay drawer (§8.4 Option A), and the toolbar lives
     in the block's top-right corner — so an open inspector sits directly on top
     of the drag handle and there is nothing left to grab. Shift the toolbar
     clear of it. Only the toolbar moves: padding the canvas instead would
     change the page width and break the vw-based type the full-width canvas
     exists to keep honest. */
  right: calc(0.5rem + var(--cms-inspector-w, 0px));
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.5rem 0.3rem 0.3rem;
  color: #fff;
  background: rgb(15 23 42 / 94%);
  border-radius: 0.375rem;
  box-shadow: 0 2px 8px rgb(0 0 0 / 25%);
  transition: opacity 120ms ease, right 150ms ease;
}

.cms-block__handle {
  cursor: grab;
  padding: 0 0.15rem;
  letter-spacing: -2px;
  /* Claims the gesture from the browser's own scrolling on touch. */
  touch-action: none;
}

.cms-block__handle:active {
  cursor: grabbing;
}

.cms-block__divider {
  width: 1px;
  height: 14px;
  background: rgb(255 255 255 / 25%);
}

.cms-block__action {
  padding: 0 0.2rem;
  line-height: 1;
  opacity: 0.75;
}

.cms-block__action:hover:not(:disabled),
.cms-block__action:focus-visible {
  opacity: 1;
}

.cms-block__action:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.cms-block__badge {
  position: absolute;
  top: 0.5rem;
  /* Same reasoning on the other side, for the palette drawer. */
  left: calc(0.5rem + var(--cms-palette-w, 0px));
  z-index: 2;
  padding: 0.2rem 0.45rem;
  font-size: 11px;
  color: #fff;
  background: rgb(37 99 235 / 95%);
  border-radius: 0.25rem;
}

@media (prefers-reduced-motion: reduce) {
  .cms-block__toolbar {
    transition: none;
  }
}
</style>
