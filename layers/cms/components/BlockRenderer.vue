<script setup lang="ts">
// The single render path. Production pages and the studio canvas both go
// through this component — there is deliberately no second renderer for the
// editor. That is what makes "see how it will look" structural rather than a
// feature to build and keep in sync. See docs/CMS_ARCHITECTURE.md §5.1.
import { defineAsyncComponent, hydrateOnVisible } from 'vue'
import type { Component } from 'vue'
import { BLOCKS_NEEDING_ID, getBlockComponent } from '../blocks'
import type { BlockInstance } from '#shared/cms/blocks'
import { migrateBlocks, resolveBlockData } from '#shared/cms/blocks'
import { DEFAULT_LOCALE } from '#shared/cms/i18n'

const props = withDefaults(defineProps<{
  blocks: BlockInstance[]
  mode?: 'display' | 'edit'
  /** Edit mode only. */
  selectedId?: string | null
  /** Edit mode only: the insert point the merchant armed by clicking it. */
  insertAt?: number | null
  /** Edit mode only: the insert point a drag is currently hovering. */
  dropIndex?: number | null
  /** Which language to render. Untranslated fields fall back to the default. */
  locale?: string
}>(), {
  mode: 'display',
  selectedId: null,
  insertAt: null,
  dropIndex: null,
  locale: DEFAULT_LOCALE,
})

// Old content is upgraded on read, so a page published before a block changed
// shape keeps rendering without anything being rewritten in the database.
const blocks = computed(() => migrateBlocks(props.blocks))

defineEmits<{
  select: [id: string]
  remove: [id: string]
  duplicate: [id: string]
  /** Insert a new block at this index (from an insert point, not a drag). */
  insert: [index: number]
  /** Reorder without dragging — the toolbar arrows. */
  move: [payload: { from: number, to: number }]
}>()

// §9.2: `<LazyFoo hydrate-on-visible />` is Nuxt compiler magic that
// `<component :is>` never receives, so a naive renderer silently drops the
// deferred-hydration work from the recent perf commits. Rebuild it explicitly.
//
// Two exceptions to lazy hydration:
//   - the first block is above the fold, so it hydrates eagerly;
//   - edit mode hydrates everything eagerly, because a canvas block that has
//     not hydrated yet ignores clicks and feels broken.
const cache = new Map<string, Component>()

function resolveComponent(blockType: string, index: number): Component | null {
  const loader = getBlockComponent(blockType)
  if (!loader) return null

  const eager = props.mode === 'edit' || index === 0
  const key = `${blockType}:${eager ? 'eager' : 'lazy'}`

  if (!cache.has(key)) {
    cache.set(key, defineAsyncComponent(
      eager
        ? { loader: loader as never }
        : { loader: loader as never, hydrate: hydrateOnVisible() },
    ))
  }

  return cache.get(key)!
}

/**
 * The props handed to the real component.
 *
 * `resolveBlockData` flattens per-language values down to one language, so a
 * component receives `title: "Saldos de Verão"` and knows nothing about
 * locales. That seam is what let multi-language content be added without
 * touching a single storefront component.
 *
 * `data` has already been validated and stripped to the schema server-side, so
 * spreading it is safe — nothing a client invented arrives here as a prop.
 */
function propsFor(block: BlockInstance): Record<string, unknown> {
  const resolved = resolveBlockData(block.blockType, block.data, props.locale)

  return BLOCKS_NEEDING_ID.has(block.blockType)
    ? { ...resolved, blockId: block.id }
    : resolved
}
</script>

<template>
  <div :class="mode === 'edit' ? 'cms-canvas' : undefined">
    <template
      v-for="(block, index) in blocks"
      :key="block.id"
    >
      <CmsInsertPoint
        v-if="mode === 'edit'"
        :index="index"
        :active="insertAt === index"
        :drop-target="dropIndex === index"
        @insert="$emit('insert', index)"
      />
      <!-- Display mode emits the bare component, exactly as a hand-written
           page would have used it. No editor markup reaches production HTML. -->
      <component
        :is="resolveComponent(block.blockType, index)"
        v-if="mode === 'display'"
        v-bind="propsFor(block)"
      />

      <CmsBlockShell
        v-else
        :block="block"
        :index="index"
        :total="blocks.length"
        :selected="block.id === selectedId"
        @select="$emit('select', block.id)"
        @remove="$emit('remove', block.id)"
        @duplicate="$emit('duplicate', block.id)"
        @move-up="$emit('move', { from: index, to: index - 1 })"
        @move-down="$emit('move', { from: index, to: index + 2 })"
      >
        <!--
          Suspense matters here. Blocks that fetch their own data - the product
          ones - have an async setup, and a page's implicit Suspense boundary
          only covers what was mounted with it. A block dropped onto an
          already-hydrated canvas has no boundary of its own, so its setup
          never resolves into output and it renders at zero height: invisible,
          unselectable, and apparently broken.
        -->
        <Suspense>
          <component
            :is="resolveComponent(block.blockType, index)"
            v-bind="propsFor(block)"
          />
          <template #fallback>
            <p class="py-16 text-center text-[12px] tracking-[0.12em] uppercase text-primary-400">
              Loading…
            </p>
          </template>
        </Suspense>
      </CmsBlockShell>
    </template>

    <!-- Trailing insert point, so the end of the page is reachable too. -->
    <CmsInsertPoint
      v-if="mode === 'edit' && blocks.length"
      :index="blocks.length"
      :active="insertAt === blocks.length"
      :drop-target="dropIndex === blocks.length"
      @insert="$emit('insert', blocks.length)"
    />
  </div>
</template>
