<script lang="ts" setup>
// Thin-line header icons matching the redesign (stroke 1.5, 24x24).
withDefaults(defineProps<{
  name: 'search' | 'account' | 'cart' | 'heart'
  filled?: boolean
  size?: number | string
}>(), {
  filled: false,
  size: 22,
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    aria-hidden="true"
  >
    <template v-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'account'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'cart'">
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" stroke-linecap="round" />
    </template>
    <template v-else-if="name === 'heart'">
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"
        :fill="filled ? 'currentColor' : 'none'"
      />
    </template>
  </svg>
</template>
