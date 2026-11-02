<script setup lang="ts">
const { loadCart } = useCart()

// The payment providers are loaded, and the first one selected, by
// CheckoutPayment on the same page.
onMounted(async () => {
  await loadCart()
})
</script>

<template>
  <UiOrderSummary
    show-items
    collapsible
  />
</template>
