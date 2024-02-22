<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
<script setup lang="ts">
import { SfModal } from '@storefront-ui/vue';

const props = defineProps<{
  modelValue?: boolean;
  tag?: string;
  disableClickAway?: boolean;
  disableEsc?: boolean;
}>();
</script>

<template>
    <UiOverlay :visible="modelValue">
      <SfModal class="md:max-h-[min(calc(100vh-32px),100%)]" v-bind="{ ...$attrs, ...props }">
        <slot />
      </SfModal>
    </UiOverlay>
  </template>

