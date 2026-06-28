<script setup lang="ts">
import { AddressEnum, type Partner } from '~~/graphql'

definePageMeta({ layout: 'checkout' })

const { cart, loadCart, totalItemsInCart } = useCart()
const { loadCountries } = useCountryList()
const { loadUser } = useAuth()

// Quietly: a missing cart is handled below by redirecting, so no error toast.
await loadCart(false)
await loadCountries()

onMounted(async () => {
  await loadUser(true)
})

// If the cart can't be retrieved at all — e.g. the session was lost, so Odoo
// returns "Cart does not exist" — there's nothing to check out. Send the
// shopper to the homepage rather than render a broken/empty checkout.
if (!cart.value?.order?.id) {
  await navigateTo('/')
}
// A valid but empty cart: nothing to pay for, point them back to the catalog.
else if (totalItemsInCart?.value === 0) {
  await navigateTo('/products')
}

// Validation is triggered by the Place Order button (in CheckoutSummary). Each
// section exposes validate() → returns the first invalid field (or null). We
// focus/scroll to the first one and block the order until everything's valid.
const contactRef = ref()
const shippingRef = ref()
const billingRef = ref()
const methodRef = ref()

const validateCheckout = (): boolean => {
  // Validate every section (so ALL invalid ones turn red at once), then focus
  // the first invalid field.
  let firstInvalid: HTMLElement | null = null
  for (const section of [contactRef, shippingRef, billingRef, methodRef]) {
    const el = section.value?.validate?.() as HTMLElement | null | undefined
    if (el && !firstInvalid) firstInvalid = el
  }
  if (firstInvalid) {
    firstInvalid.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    firstInvalid.focus?.()
    return false
  }
  return true
}
provide('checkoutValidate', validateCheckout)

// The payment widget now lives in the Payment section (under the provider
// selection), but the "Place Order" button lives in the summary. Share the
// provider's submit handler + loading state between them.
const paymentHandler = ref<(() => void) | null>(null)
const paymentLoading = ref(false)
const paymentError = ref('')
provide('paymentHandler', paymentHandler)
provide('paymentLoading', paymentLoading)
provide('paymentError', paymentError)
</script>

<template>
  <div class="narrow-container mb-24">
    <h1 class="font-bold typography-headline-3 md:typography-headline-2 mt-8 mb-10">
      {{ $t('checkout') }}
    </h1>

    <div
      v-if="cart?.order?.id"
      class="lg:grid lg:grid-cols-12 lg:gap-x-12"
    >
      <!-- Order summary: collapsed at the top on mobile, sticky on the right on
           desktop (placed via grid columns; first in DOM so it leads on mobile). -->
      <div class="lg:col-start-8 lg:col-span-5 lg:row-start-1 mb-8 lg:mb-0">
        <div class="lg:sticky lg:top-24 h-fit">
          <CheckoutSummary />
        </div>
      </div>

      <!-- Inline steps (left column on desktop) -->
      <div class="lg:col-start-1 lg:col-span-7 lg:row-start-1">
        <div class="divide-y divide-primary-100">
          <LazyCheckoutContactInformation
            v-if="cart?.order?.partner"
            ref="contactRef"
            :step="1"
            :heading="$t('contactInfo.heading')"
            :partner-data="cart?.order?.partner as Partner"
          />
          <LazyCheckoutAddressForm
            ref="shippingRef"
            :step="2"
            :heading="$t('shipping.heading')"
            :description="$t('shipping.description')"
            :button-text="$t('shipping.addButton')"
            :type="AddressEnum.Shipping"
            :saved-address="cart.order?.partnerShipping as Partner"
          />
          <LazyCheckoutAddressForm
            ref="billingRef"
            :step="3"
            :heading="$t('billing.heading')"
            :description="$t('billing.description')"
            :button-text="$t('billing.addButton')"
            :type="AddressEnum.Billing"
            :saved-address="cart.order?.partnerInvoice as Partner"
          />
          <LazyCheckoutShippingMethod
            ref="methodRef"
            :step="4"
          />
          <LazyCheckoutPayment :step="5" />
        </div>

        <!-- Mobile: Place Order + payment error right after the payment form
             (on desktop the button lives at the foot of the summary instead). -->
        <CheckoutPlaceOrder class="lg:hidden mt-8" />
      </div>
    </div>
  </div>
</template>
