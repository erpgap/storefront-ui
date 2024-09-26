<template>
  <div v-if="showPaymentModal">
    <ProviderListOptions
      :active-provider="selectedProvider || paymentProviders[0]"
      :payment-providers="paymentProviders"
      @update:active-payment="updateSelectedProvider"
    />
  </div>
</template>

<script setup lang="ts">
import type { PaymentProvider } from "~/graphql";

const {
  loadPaymentMethods,
  paymentProviders,
  loading: paymentLoading,
} = usePayment();

const selectedProvider = ref<PaymentProvider | null>(null);
const showPaymentModal = ref(false);

await loadPaymentMethods();

if (paymentProviders.value.length > 0) {
  showPaymentModal.value = true;
  selectedProvider.value = paymentProviders.value[0];
}

function updateSelectedProvider(provider: PaymentProvider) {
  selectedProvider.value = provider;
}
</script>
