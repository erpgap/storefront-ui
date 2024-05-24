<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue';

type AccountDataProps = {
  header: string;
  buttonText: string;
};

defineProps<AccountDataProps>();
defineEmits(['on-click']);
</script>

<template>
  <div class="md:mx-4" data-testid="account-data">
    <div class="flex justify-between my-2">
      <h2 class="typography-headline-4 font-bold">{{ header }}</h2>
      <SfButton
        variant="tertiary"
        size="sm"
        class="self-start"
        @click="$emit('on-click')"
        >{{ buttonText }}</SfButton
      >
    </div>
    <div class="my-2">
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
