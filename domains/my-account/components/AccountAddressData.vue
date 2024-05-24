<script setup lang="ts">
import { SfButton } from "@storefront-ui/vue";

type AddressDataProps = {
  header: string;
  buttonText: string;
};

defineProps<AddressDataProps>();
defineEmits(["on-click"]);
</script>

<template>
  <div
    class="border-neutral-200 border-b md:border p-2 md:rounded-md"
    data-testid="address-data"
  >
    <div class="flex justify-between my-2">
      <h2 class="typography-headline-4 font-bold">
        {{ header }}
      </h2>
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
    <div class="flex gap-2 justify-end">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped></style>
