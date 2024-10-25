<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue';
const { loadCart } = useCart();

await loadCart(false);
</script>

<template>
  <div
    class="w-full min-h-[330px] flex flex-col gap-4 items-center justify-center"
  >
    <Icon
      name="i-material-symbols-check-circle"
      class="size-20 text-primary-700"
    />
    <h1 class="text-3xl font-bold">Thank you for your purchase!</h1>
    <p>Your order will be shipped soon.</p>
    <SfButton @click="navigateTo('/')" size="lg" variant="secondary">
      Continue shopping
    </SfButton>
  </div>
</template>

<style scoped></style>
