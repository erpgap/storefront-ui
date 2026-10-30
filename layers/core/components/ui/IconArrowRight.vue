<script setup lang="ts">
// The arrow on calls to action and "view all" links. Height keeps the 18:14
// of the drawing.
withDefaults(defineProps<{ width?: number }>(), { width: 18 })
</script>

<template>
  <svg
    :width="width"
    :height="Math.round(width * 14 / 18)"
    viewBox="0 0 18 14"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    aria-hidden="true"
  >
    <path
      d="M1 7h15M11 1l5 6-5 6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
