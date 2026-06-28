<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

const { loadCart } = useCart()
const { getPaymentConfirmation } = usePayment()

// The confirmation page is only meaningful when there's a placed order for this
// session. We key off the order (not the cart): after a successful order the
// draft cart is gone — so gating on the cart would wrongly redirect shoppers
// who just paid. If there's no order to confirm (e.g. the session was lost or
// the URL was opened directly), send them home instead of showing an error.
const orderName = ref('')
let order: { id?: number, name?: string } | null = null
try {
  order = (await getPaymentConfirmation(false))?.order ?? null
}
catch {
  order = null
}

if (!order?.id) {
  await navigateTo('/')
}
else {
  orderName.value = order.name || ''
  // Order placed → the draft cart no longer exists. Refresh quietly to reset
  // the header count (a "Cart does not exist" here is expected, so no toast).
  await loadCart(false)
}
</script>

<template>
  <div class="narrow-container">
    <div class="max-w-[560px] mx-auto text-center py-20 md:py-28">
      <span class="mx-auto mb-8 grid place-items-center w-16 h-16 rounded-full border border-green-200 bg-green-50 text-green-700">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="m5 12.5 4.5 4.5L19 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>

      <p class="text-[13px] tracking-[0.18em] uppercase text-primary-500 mb-3">
        {{ $t('thankYou.eyebrow') }}
      </p>
      <h1 class="font-bold typography-headline-3 md:typography-headline-2 mb-4">
        {{ $t('thankYou.heading') }}
      </h1>
      <p class="text-primary-600 leading-relaxed">
        {{ $t('thankYou.message') }}
      </p>

      <div
        v-if="orderName"
        class="mt-8 border-y border-primary-100 py-4 flex items-center justify-center gap-3"
      >
        <span class="text-[12px] tracking-[0.1em] uppercase text-primary-500">
          {{ $t('thankYou.orderReference') }}
        </span>
        <span class="text-[15px] font-semibold">#{{ orderName }}</span>
      </div>

      <div class="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <SfButton
          size="lg"
          @click="navigateTo('/my-account/my-orders')"
        >
          {{ $t('thankYou.viewOrders') }}
        </SfButton>
        <SfButton
          size="lg"
          variant="secondary"
          @click="navigateTo('/')"
        >
          {{ $t('thankYou.continueShopping') }}
        </SfButton>
      </div>
    </div>
  </div>
</template>
