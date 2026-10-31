<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'
import type { Ref } from 'vue'

const { cart } = useCart()
const { makeGiftCardPayment } = useDiscount()
// On while checkout changes what the order costs (a code being applied, the
// delivery method being set): an order placed then would be paid at the
// amount from before the change.
const { loading: checkoutBusy } = useCheckout()

// Follows the cart: a copy taken at setup never saw a gift card applied on
// this page, so the gift card button could not appear without a reload.
const hasFullPaymentWithGiftCard = computed(
  () => (cart.value?.order?.giftCards?.length ?? 0) > 0 && cart.value?.order?.amountTotal === 0,
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
const { paymentProviders } = usePayment()
const { t } = useI18n()

const processing = ref(false)
const placeOrder = async () => {
  if (!validateCheckout()) return
  if (!paymentHandler?.value) {
    // Otherwise a valid form and no payment provider in Odoo means a click
    // that does nothing at all.
    if (!paymentProviders.value.length && paymentError) {
      paymentError.value = t('checkoutPayment.unavailable')
    }
    return
  }
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
      :disabled="processing || checkoutBusy"
      @click.prevent="handleGiftCardPayment"
    >
      {{ processing ? $t('placingOrder') : $t('placeOrder') }}
    </SfButton>
    <SfButton
      v-else
      size="lg"
      class="w-full"
      :disabled="processing || paymentLoading || checkoutBusy"
      @click="placeOrder"
    >
      {{ processing ? $t('placingOrder') : $t('placeOrder') }}
    </SfButton>

    <UiFormMessage
      v-if="paymentError"
      class="mt-4"
    >
      {{ paymentError }}
    </UiFormMessage>
  </div>
</template>
