<script setup lang="ts">
defineProps<{
  // Show the cart line items inside the box (checkout). The cart page lists
  // items in its own column, so it leaves this off.
  showItems?: boolean
}>()

const { cart, totalItemsInCart } = useCart()

const lines = computed<any[]>(() => cart.value?.order?.websiteOrderLine ?? [])
// Match the product card's discount logic (combinationInfoVariant.list_price).
const hasDiscount = (line: any) =>
  !!line?.product?.combinationInfoVariant?.has_discounted_price
const oldPrice = (line: any) =>
  (line?.product?.combinationInfoVariant?.list_price || 0) * (line?.quantity ?? 1)
const shippingPrice = computed(() => Number(cart.value?.order?.shippingMethod?.price) || 0)
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
        {{ totalItemsInCart }} {{ totalItemsInCart === 1 ? $t('item') : $t('items') }}
      </p>
    </div>

    <!-- Line items (checkout only) -->
    <ul
      v-if="showItems && lines.length"
      class="px-5 md:px-6 border-t border-primary-100 divide-y divide-primary-100"
    >
      <li
        v-for="line in lines"
        :key="line?.id"
        class="flex items-start gap-3.5 py-4"
      >
        <!-- relative wrapper is NOT clipped, so the qty badge can overflow the thumbnail -->
        <span class="relative shrink-0 w-16 h-16">
          <span class="block w-full h-full rounded-[2px] bg-primary-50 overflow-hidden">
            <NuxtImg
              provider="odooProvider"
              :src="line.product?.imageUrl ?? ''"
              :alt="line.product?.name ?? ''"
              width="64"
              height="64"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </span>
          <span class="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 rounded-full bg-primary-700 text-white text-[11px] font-medium grid place-items-center">
            {{ line.quantity }}
          </span>
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-[14px] font-medium leading-snug">{{ line.product?.name || line.name }}</span>
          <ul
            v-if="line.product?.variantAttributeValues?.length"
            class="mt-1.5 text-[12px] tracking-[0.14em] uppercase font-medium space-y-0.5"
          >
            <li
              v-for="attribute in line.product?.variantAttributeValues"
              :key="attribute.id"
              class="text-primary-400"
            >
              {{ attribute.attribute?.name }}<span class="text-black"> — {{ attribute.name }}</span>
            </li>
          </ul>
        </span>
        <span class="flex items-baseline gap-2 whitespace-nowrap">
          <span class="text-[14px]">{{ $currency(line.priceSubtotal || 0) }}</span>
          <span
            v-if="hasDiscount(line)"
            class="text-[12px] text-primary-300 line-through"
          >
            {{ $currency(oldPrice(line)) }}
          </span>
        </span>
      </li>
    </ul>

    <div class="px-5 md:px-6 pb-6 pt-4 text-[14px]">
      <UiDiscount class="mb-5" />

      <div class="flex justify-between py-1.5">
        <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">{{ $t("itemsSubtotal") }}</span>
        <span data-testid="special-price">{{ $currency(cart?.order?.amountSubtotal || 0) }}</span>
      </div>
      <div class="flex justify-between py-1.5">
        <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">{{ $t("delivery") }}</span>
        <span>{{ shippingPrice > 0 ? $currency(shippingPrice) : $t('free') }}</span>
      </div>
      <div class="flex justify-between py-1.5">
        <span class="text-[13px] tracking-[0.08em] uppercase text-primary-500">{{ $t("estimatedTax") }}</span>
        <span>{{ $currency(Number(cart?.order?.amountTax) || 0) }}</span>
      </div>

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

      <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6 text-[11px] tracking-[0.1em] uppercase text-primary-400">
        <span class="inline-flex items-center gap-1.5">
          <UiLineIcon name="lock" :size="15" /> {{ $t("trust.secure") }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <UiLineIcon name="returns" :size="15" /> {{ $t("trust.returns") }}
        </span>
        <span class="inline-flex items-center gap-1.5">
          <UiLineIcon name="shield" :size="15" /> {{ $t("trust.encrypted") }}
        </span>
      </div>
    </div>
  </div>
</template>
