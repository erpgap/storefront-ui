<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue';
const { loadCart } = useCart();

await loadCart(false);
</script>

<template>
  <div
    class="w-full min-h-[600px] md:min-h-[330px] text-center md:text-left flex flex-col gap-4 items-center justify-center"
  >
    <Icon
      name="i-material-symbols-warning-rounded"
      class="size-20 text-primary-700"
    />
    <h1 class="text-3xl font-bold">Oh no, your payment failed</h1>
    <p>Unfortunately, the payment for this order has failed.</p>
    <SfButton @click="navigateTo('/cart')" size="lg" variant="secondary">
      Try again
    </SfButton>
  </div>
</template>

<style scoped></style>
