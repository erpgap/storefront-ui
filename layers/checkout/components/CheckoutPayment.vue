<template>
  <div v-if="showPaymentModal">
    <ProviderListOptions :active-provider="selectedProvider || paymentProviders[0]"
      :payment-providers="paymentProviders" @update:active-payment="updateSelectedProvider" />
  </div>
</template>

<script setup lang="ts">
import type { PaymentProvider } from '~/graphql'

const {
  loadPaymentMethods,
  paymentProviders,
  selectedProvider,
  updateSelectedProvider,
} = usePayment()

const showPaymentModal = ref<boolean>(false)

  onMounted(async () => {
    await loadPaymentMethods()
  })

watch(() => paymentProviders.value, () => {
  if (paymentProviders.value.length > 0) {
    showPaymentModal.value = true
    updateSelectedProvider(paymentProviders.value[0])
  }
}, {
  deep: true,
  immediate: true,
})
</script>
