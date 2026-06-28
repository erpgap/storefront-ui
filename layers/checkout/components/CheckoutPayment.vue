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
      <!-- Provider selection (shows the provider name, e.g. "Stripe") -->
      <ProviderListOptions
        :active-provider="selectedProvider || paymentProviders[0]"
        :payment-providers="paymentProviders"
        @update:active-payment="updateSelectedProvider"
      />

      <!-- Selected provider's payment form, rendered open and ready right below
           the selection. -->
      <component
        :is="activePaymentComponent"
        v-if="activePaymentComponent && selectedProvider?.code"
        :key="selectedProvider?.id"
        :provider="selectedProvider"
        :cart="cart"
        class="mt-5 max-w-[640px]"
        @provider-payment-handler="onPaymentHandler"
        @payment-loading="onPaymentLoading"
        @payment-error="onPaymentError"
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
import ProviderStripe from './ProviderStripe.vue'
import ProviderAdyen from './ProviderAdyen.vue'
import type { Component, Ref } from 'vue'

defineProps({
  step: { type: [String, Number], default: '' },
})

const { cart } = useCart()
const {
  loadPaymentMethods,
  paymentProviders,
  selectedProvider,
  updateSelectedProvider,
} = usePayment()

// Map the Odoo provider `code` to the actual payment-widget component. Real
// component objects are required: a string name passed to `<component :is>`
// does not resolve in a production build (Nuxt only auto-imports components
// used statically), so it would silently render an empty element.
const PAYMENT_PROVIDER_COMPONENTS: Record<string, Component> = {
  stripe: ProviderStripe,
  adyen: ProviderAdyen,
}
const activePaymentComponent = computed(
  () => PAYMENT_PROVIDER_COMPONENTS[selectedProvider.value?.code ?? ''] ?? null,
)

// Hand the provider's submit handler + loading state up to the Place Order
// button in the summary (provided by the checkout page).
const paymentHandler = inject<Ref<(() => void) | null>>('paymentHandler')
const paymentLoading = inject<Ref<boolean>>('paymentLoading')
const paymentError = inject<Ref<string>>('paymentError')
const onPaymentHandler = (handler: () => void) => {
  if (paymentHandler) paymentHandler.value = handler
}
const onPaymentLoading = (value: boolean) => {
  if (paymentLoading) paymentLoading.value = value
}
const onPaymentError = (message: string) => {
  if (paymentError) paymentError.value = message
}

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
