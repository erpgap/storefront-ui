<template>
  <div
    v-if="visible"
    class="w-full h-full top-0 bottom-0 left-0 right-0 bg-neutral-500/50 fixed z-50"
    data-testid="overlay"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
export interface OverlayProps {
  visible?: boolean
}

defineProps<OverlayProps>()
</script>
