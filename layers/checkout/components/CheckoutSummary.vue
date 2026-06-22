<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

import type { PaymentProvider } from '~~/graphql'

const { cart, loadCart } = useCart()

const { makeGiftCardPayment, loading: discountLoading } = useDiscount()
const { loadPaymentMethods, paymentProviders, selectedProvider } = usePayment()

const isPaymentWithCardReady = ref(false)
const providerPaymentHandler = ref()
const loading = ref(false)
const showPaymentModal = ref(true)
const giftCards = ref(cart.value?.order?.giftCards)

const hasFullPaymentWithGiftCard = computed(
  () => giftCards.value?.length > 0 && cart.value?.order?.amountTotal === 0,
)

// Place Order is clickable at any time. On click we validate the section forms
// (red borders + focus the first empty/invalid field, via the page) and only
// proceed to payment when everything is valid — no proactive error messages.
const validateCheckout = inject<() => boolean>('checkoutValidate', () => true)
const placeOrder = () => {
  if (!validateCheckout()) return
  providerPaymentHandler.value?.()
}

onMounted(async () => {
  await loadCart()
  await loadPaymentMethods()
  showPaymentModal.value = true
  if (paymentProviders.value.length > 0) {
    selectedProvider.value = paymentProviders.value[0]
  }
})

const handleGiftCardPayment = async () => {
  await makeGiftCardPayment()
}
</script>

<template>
  <UiOrderSummary show-items>
    <SfButton
      v-if="hasFullPaymentWithGiftCard"
      size="lg"
      class="w-full mb-4 md:mb-0"
      :disabled="discountLoading"
      @click.prevent="handleGiftCardPayment"
    >
      {{ $t('placeOrder') }}
    </SfButton>

    <SfButton
      v-else
      size="lg"
      class="w-full mb-4 md:mb-0"
      :disabled="loading"
      @click="placeOrder"
    >
      {{ $t('placeOrder') }}
    </SfButton>

    <component
      :is="getPaymentProviderComponentName(selectedProvider?.code)"
      v-if="
        showPaymentModal &&
        !!selectedProvider?.code &&
        !hasFullPaymentWithGiftCard
      "
      :key="selectedProvider?.id"
      :provider="selectedProvider"
      :cart="cart"
      :show-payment-modal="showPaymentModal"
      @is-payment-ready="($event: any) => (isPaymentWithCardReady = $event)"
      @provider-payment-handler="
        ($event: any) => (providerPaymentHandler = $event)
      "
      @payment-loading="($event: any) => (loading = $event)"
    />
  </UiOrderSummary>
</template>
