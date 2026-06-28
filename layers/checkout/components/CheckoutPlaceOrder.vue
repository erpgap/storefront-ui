<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'
import type { Ref } from 'vue'

const { cart } = useCart()
const { makeGiftCardPayment, loading: discountLoading } = useDiscount()

const giftCards = ref(cart.value?.order?.giftCards)
const hasFullPaymentWithGiftCard = computed(
  () => (giftCards.value?.length ?? 0) > 0 && cart.value?.order?.amountTotal === 0,
)

// Shared with the payment form (provided by the checkout page) so this button
// can live anywhere — at the foot of the summary on desktop, or right after the
// payment form on mobile. The error renders here too, next to the button.
const validateCheckout = inject<() => boolean>('checkoutValidate', () => true)
const paymentHandler = inject<Ref<(() => void) | null>>('paymentHandler')
const paymentLoading = inject<Ref<boolean>>('paymentLoading')
const paymentError = inject<Ref<string>>('paymentError')

// `processing` is set only while the order is actually being placed (after a
// click), kept separate from `paymentLoading` (which is also true while the
// Stripe form first loads) so the button doesn't read "Placing order…" before
// the shopper has even clicked. Convention: disable + swap the label, no spinner.
const processing = ref(false)
const placeOrder = async () => {
  if (!validateCheckout()) return
  if (!paymentHandler?.value) return
  processing.value = true
  try {
    await paymentHandler.value()
  }
  finally {
    processing.value = false
  }
}
const handleGiftCardPayment = async () => {
  processing.value = true
  try {
    await makeGiftCardPayment()
  }
  finally {
    processing.value = false
  }
}
</script>

<template>
  <div>
    <SfButton
      v-if="hasFullPaymentWithGiftCard"
      size="lg"
      class="w-full"
      :disabled="processing || discountLoading"
      @click.prevent="handleGiftCardPayment"
    >
      {{ processing ? $t('placingOrder') : $t('placeOrder') }}
    </SfButton>
    <SfButton
      v-else
      size="lg"
      class="w-full"
      :disabled="processing || paymentLoading"
      @click="placeOrder"
    >
      {{ processing ? $t('placingOrder') : $t('placeOrder') }}
    </SfButton>

    <UiFormError
      v-if="paymentError"
      class="mt-4"
    >
      {{ paymentError }}
    </UiFormError>
  </div>
</template>
