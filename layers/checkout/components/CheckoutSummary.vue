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
  >
    <!-- Desktop: Place Order sits at the foot of the summary. On mobile the
         summary is collapsed and the button is rendered right after the payment
         form instead (see the checkout page), so it's hidden here below lg. -->
    <CheckoutPlaceOrder class="hidden lg:block" />
  </UiOrderSummary>
</template>
