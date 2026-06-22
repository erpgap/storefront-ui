<template>
  <section
    class="py-7"
    data-testid="checkout-payment"
  >
    <div class="flex items-center gap-3 mb-5">
      <span
        v-if="step"
        class="w-[26px] h-[26px] rounded-full grid place-items-center text-[12px] shrink-0 border border-primary-200 text-primary-500"
      >{{ step }}</span>
      <h2 class="text-[13px] tracking-[0.14em] uppercase font-semibold">
        {{ $t("checkoutPayment.heading") }}
      </h2>
    </div>

    <div
      v-if="showPaymentModal"
      class="md:pl-[38px]"
    >
      <ProviderListOptions
        :active-provider="selectedProvider || paymentProviders[0]"
        :payment-providers="paymentProviders"
        @update:active-payment="updateSelectedProvider"
      />
    </div>
    <p
      v-else
      class="md:pl-[38px] text-[14px] text-primary-400"
    >
      {{ $t("checkoutPayment.loadingPayment") }}
    </p>
  </section>
</template>

<script setup lang="ts">
defineProps({
  step: { type: [String, Number], default: '' },
})

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
