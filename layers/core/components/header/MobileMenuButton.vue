<script lang="ts" setup>
import { SfButton } from '@storefront-ui/vue'

defineProps<{
  isOpen: boolean
  controls: string
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <SfButton
    class="block font-body bg-transparent hover:bg-white active:bg-white self-end !pl-0 mr-[4px]"
    type="button"
    variant="tertiary"
    square
    :aria-haspopup="true"
    :aria-expanded="isOpen"
    :aria-controls="controls"
    :aria-label="$t('openMenu')"
    @click="$emit('toggle')"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="16"
      viewBox="0 0 22 16"
      fill="none"
      aria-hidden="true"
    >
      <rect width="22" height="1.76" transform="matrix(-1 0 0 1 22 0)" fill="black" />
      <rect width="22" height="1.76" transform="matrix(-1 0 0 1 22 7.04016)" fill="black" />
      <rect width="22" height="1.76" transform="matrix(-1 0 0 1 22 14.08)" fill="black" />
    </svg>
  </SfButton>
</template>
