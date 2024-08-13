<script setup lang="ts">
import type { PropType } from 'vue';
import type { Order } from '~/graphql';

const props = defineProps({
  order: { type: Object as PropType<Order>, required: true },
});
</script>

<template>
  <div
    v-if="order.coupons"
    class="flex justify-between typography-text-base mb-2"
  >
    <p class="flex grow pr-2">
      {{ $t('discounts', { count: order.coupons.length }) }}
    </p>
    <p class="flex text-right">
      {{ $currency(Number(order?.amountDiscounts)) }}
    </p>
  </div>
  <div
    v-if="order.giftCards"
    class="flex justify-between typography-text-base mb-4"
  >
    <p class="flex grow pr-2">
      {{ $t('giftCard', { count: order.giftCards.length }) }}
    </p>
    <p class="flex text-right">
      {{ $currency(Number(order?.amountGiftCards)) }}
    </p>
  </div>
</template>

<style scoped></style>
