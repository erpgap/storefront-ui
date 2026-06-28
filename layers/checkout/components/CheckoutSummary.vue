<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

import type { Ref } from 'vue'

const { cart, loadCart } = useCart()

const { makeGiftCardPayment, loading: discountLoading } = useDiscount()
const { loadPaymentMethods, paymentProviders, selectedProvider } = usePayment()

const giftCards = ref(cart.value?.order?.giftCards)

const hasFullPaymentWithGiftCard = computed(
  () => giftCards.value?.length > 0 && cart.value?.order?.amountTotal === 0,
)

// The payment form lives in the Payment section; it shares its submit handler,
// loading state and error message with this button via the checkout page.
const paymentHandler = inject<Ref<(() => void) | null>>('paymentHandler')
const paymentLoading = inject<Ref<boolean>>('paymentLoading')
const paymentError = inject<Ref<string>>('paymentError')

// Place Order is clickable at any time. On click we validate the section forms
// (red borders + focus the first empty/invalid field, via the page) and only
// proceed to payment when everything is valid — no proactive error messages.
const validateCheckout = inject<() => boolean>('checkoutValidate', () => true)
const placeOrder = () => {
  if (!validateCheckout()) return
  paymentHandler?.value?.()
}

onMounted(async () => {
  await loadCart()
  await loadPaymentMethods()
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
      :disabled="paymentLoading"
      @click="placeOrder"
    >
      {{ $t('placeOrder') }}
    </SfButton>

    <UiFormError
      v-if="paymentError"
      class="mt-4"
    >
      {{ paymentError }}
    </UiFormError>
  </UiOrderSummary>
</template>
