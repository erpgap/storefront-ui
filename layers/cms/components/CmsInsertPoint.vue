<script setup lang="ts">
// An explicit "put a block HERE" target between every pair of blocks.
//
// Drag-and-drop is the nice way to choose position, but it must not be the ONLY
// way: HTML5 drag is unreliable across browsers, impossible on touch, and
// unusable by keyboard. This gives the same control — exact insertion position —
// as a plain button, and it doubles as a much larger drop target than the 2px
// line ever was.
defineProps<{
  index: number
  active: boolean
  dropTarget: boolean
}>()

defineEmits<{ insert: [] }>()
</script>

<template>
  <div
    class="cms-insert"
    :class="{ 'cms-insert--active': active, 'cms-insert--drop': dropTarget }"
    :data-cms-insert-index="index"
  >
    <span class="cms-insert__line" />
    <button
      type="button"
      class="cms-insert__button"
      :aria-label="`Add a block at position ${index + 1}`"
      @click="$emit('insert')"
    >
      + Add block here
    </button>
    <span class="cms-insert__line" />
  </div>
</template>

<style scoped>
.cms-insert {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  /* Tall enough to be an easy drop target, short enough not to distort the
     page's real spacing on the canvas. */
  height: 34px;
  margin: -17px 0;
  padding: 0 1rem;
  opacity: 0;
  transition: opacity 120ms ease;
}

.cms-insert:hover,
.cms-insert--active,
.cms-insert--drop {
  opacity: 1;
}

.cms-insert__line {
  flex: 1;
  height: 2px;
  background: rgb(37 99 235);
}

.cms-insert--drop .cms-insert__line {
  height: 4px;
}

.cms-insert__button {
  flex: none;
  padding: 0.25rem 0.7rem;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #fff;
  white-space: nowrap;
  background: rgb(37 99 235);
  border-radius: 999px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 25%);
}

.cms-insert__button:hover {
  background: rgb(29 78 216);
}

.cms-insert--drop .cms-insert__button {
  background: rgb(29 78 216);
}

@media (prefers-reduced-motion: reduce) {
  .cms-insert {
    transition: none;
  }
}
</style>
