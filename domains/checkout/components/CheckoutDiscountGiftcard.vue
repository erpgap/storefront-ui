<script setup lang="ts">
import { SfButton, SfInput } from '@storefront-ui/vue';
const value = ref('');
</script>

<template>
  <div class="w-full py-4 flex items-center gap-4">
    <div class="w-full">
      <SfInput
        v-model="value"
        size="lg"
        placeholder="Discount code or gift card"
      />
    </div>

    <SfButton :disabled="!value" size="lg" variant="secondary">
      Apply
    </SfButton>
  </div>
</template>

<style scoped></style>
