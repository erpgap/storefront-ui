<script setup lang="ts">
const { loadCart } = useCart()
const { loadPaymentMethods, paymentProviders, selectedProvider } = usePayment()

onMounted(async () => {
  await loadCart()
  await loadPaymentMethods()
  if (paymentProviders.value.length > 0) {
    selectedProvider.value = paymentProviders.value[0]
  }
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
