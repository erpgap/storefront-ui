<template>
  <section
    class="py-7"
    data-testid="checkout-payment"
  >
    <CheckoutStepHeading
      :step="step"
      :heading="$t('checkoutPayment.heading')"
    />

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
      {{ providersLoaded ? $t("checkoutPayment.unavailable") : $t("checkoutPayment.loadingPayment") }}
    </p>
  </section>
</template>

<script setup lang="ts">
import type { Component, Ref } from 'vue'
import ProviderStripe from './ProviderStripe.vue'
import ProviderAdyen from './ProviderAdyen.vue'

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
// With no provider set up in Odoo the list stays empty, and "loading" would
// then be on screen for good.
const providersLoaded = ref(false)

onMounted(async () => {
  await loadPaymentMethods()
  providersLoaded.value = true
})

watch(() => paymentProviders.value, () => {
  const [firstProvider] = paymentProviders.value
  if (firstProvider) {
    showPaymentModal.value = true
    updateSelectedProvider(firstProvider)
  }
}, {
  deep: true,
  immediate: true,
})
</script>
