<script setup lang="ts">
import { AddressEnum, type Partner } from '~~/graphql'

definePageMeta({ layout: 'checkout' })

const { cart, loadCart, totalItemsInCart } = useCart()
const { loadCountries } = useCountryList()
const { loadUser } = useAuth()

await loadCart()
await loadCountries()

onMounted(async () => {
  await loadUser(true)
})

if (totalItemsInCart?.value === 0) {
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
      <!-- Left: inline steps -->
      <div class="lg:col-span-7 divide-y divide-primary-100">
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

      <!-- Right: shared order summary (sticky) -->
      <div class="lg:col-span-5 mt-10 lg:mt-0">
        <div class="lg:sticky lg:top-24 h-fit">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  </div>
</template>
