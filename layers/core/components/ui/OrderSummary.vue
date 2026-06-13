<script setup lang="ts">
const { cart, totalItemsInCart } = useCart()

// Shipping & tax are only known once a method/address is set. Until then show
// a note instead of misleading "$0.00" rows (matches the mini-cart drawer).
const hasBreakdown = computed(() => {
  const tax = Number(cart.value?.order?.amountTax) || 0
  const shipping = Number(cart.value?.order?.shippingMethod?.price) || 0
  return tax > 0 || shipping > 0
})
</script>

<template>
  <div
    class="border border-primary-100 rounded-[2px]"
    data-testid="order-summary"
  >
    <div class="flex justify-between items-baseline px-5 md:px-6 pt-6 pb-4">
      <p class="text-[18px] font-medium tracking-[-0.01em]">
        {{ $t("orderSummary") }}
      </p>
      <p class="text-[13px] text-primary-500" data-testid="total-in-cart">
        {{ $t("itemsInCart", { count: totalItemsInCart }) }}
      </p>
    </div>

    <div class="px-5 md:px-6 pb-6 text-[14px]">
      <div class="flex justify-between py-1.5">
        <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">{{ $t("itemsSubtotal") }}</span>
        <span data-testid="special-price">{{ $currency(cart?.order?.amountSubtotal || 0) }}</span>
      </div>

      <template v-if="hasBreakdown">
        <div class="flex justify-between py-1.5">
          <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">{{ $t("delivery") }}</span>
          <span>{{ $currency(cart?.order?.shippingMethod?.price || 0) }}</span>
        </div>
        <div class="flex justify-between py-1.5">
          <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">{{ $t("estimatedTax") }}</span>
          <span>{{ $currency(Number(cart?.order?.amountTax)) }}</span>
        </div>
      </template>
      <p v-else class="py-1.5 text-[13px] text-primary-400">
        Shipping &amp; taxes calculated at checkout.
      </p>

      <div
        v-if="cart.order?.coupons"
        class="flex justify-between py-1.5"
      >
        <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">{{ $t("discounts", { count: cart.order.coupons.length }) }}</span>
        <span>{{ $currency(Number(cart.order?.amountDiscounts)) }}</span>
      </div>
      <div
        v-if="cart.order?.giftCards"
        class="flex justify-between py-1.5"
      >
        <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">{{ $t("giftCard", { count: cart.order.giftCards.length }) }}</span>
        <span>{{ $currency(Number(cart.order?.amountGiftCards)) }}</span>
      </div>

      <div class="flex justify-between items-baseline mt-4 pt-4 border-t border-primary-100">
        <span class="text-[16px] font-medium uppercase tracking-[0.08em]">{{ $t("total") }}</span>
        <span class="text-[18px] font-medium" data-testid="total">
          {{ $currency(Number(cart?.order?.amountTotal)) }}
        </span>
      </div>

      <div class="mt-6">
        <slot />
      </div>
    </div>
  </div>
</template>
