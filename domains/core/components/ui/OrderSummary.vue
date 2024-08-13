<script setup lang="ts">
const { cart } = useCart();
</script>

<template>
  <div
    class="shadow-lg md:rounded-md md:border md:border-neutral-100"
    data-testid="order-summary"
  >
    <div
      class="flex justify-between items-end py-2 px-4 md:px-6 md:pt-6 md:pb-4"
    >
      <p class="typography-headline-4 font-bold md:typography-headline-3">
        {{ $t('orderSummary') }}
      </p>
      <p class="typography-text-base font-medium" data-testid="total-in-cart">
        {{
          $t('itemsInCart', { count: cart?.order?.websiteOrderLine?.length })
        }}
      </p>
    </div>
    <div class="px-4 pb-4 mt-3 md:px-6 md:pb-6 md:mt-0">
      <div class="flex justify-between typography-text-base mb-2">
        <div class="flex flex-col grow pr-2 gap-2">
          <p>{{ $t('itemsSubtotal') }}</p>
          <p>{{ $t('delivery') }}</p>
          <p>{{ $t('estimatedTax') }}</p>
        </div>
        <div class="flex flex-col gap-2 text-right">
          <p data-testid="special-price">
            {{ $currency(cart?.order?.amountSubtotal || 0) }}
          </p>
          <p>
            {{ $currency(cart?.order?.shippingMethod?.price || 0) }}
          </p>
          <p>{{ $currency(Number(cart?.order?.amountTax)) }}</p>
        </div>
      </div>
      <UiOrderSummaryDiscount :order="cart?.order" />
      <div
        class="flex justify-between typography-headline-4 md:typography-headline-3 font-bold pb-4 mb-4"
      >
        <p>{{ $t('total') }}</p>
        <p data-testid="total">
          {{ $currency(Number(cart?.order?.amountTotal)) }}
        </p>
      </div>
      <UiDivider class="my-4 w-auto" />
      <slot />
    </div>
  </div>
</template>
