<script setup lang="ts">
// The boxed message under a form: what went wrong, or that a save worked.
// A message on one field is UiFieldError instead.
withDefaults(defineProps<{ type?: 'error' | 'success' }>(), { type: 'error' })
</script>

<template>
  <p
    class="flex items-start gap-2 border text-[13px] px-3 py-2.5"
    :class="type === 'success'
      ? 'border-green-200 bg-green-50 text-green-700'
      : 'border-red-200 bg-red-50 text-red-700'"
    role="alert"
  >
    <slot />
  </p>
</template>
