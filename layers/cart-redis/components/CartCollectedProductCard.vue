<script setup lang="ts">
import { SfIconClose, SfLink } from '@storefront-ui/vue'
import type { CustomOrderLineWithStockFromRedis, Product } from '~~/graphql'

const NuxtLink = resolveComponent('NuxtLink')

const props = defineProps({
  orderLine: {
    type: Object as PropType<CustomOrderLineWithStockFromRedis>,
    required: true,
  },
})

const { updateItemQuantity, removeItemFromCart, lineErrors } = useCart()
</script>

<template>
  <div
    class="flex gap-4 sm:gap-5 py-5"
    data-testid="cart-product-card"
  >
    <SfLink
      :tag="NuxtLink"
      :to="mountUrlSlugForProductVariant(orderLine.product as Product)"
      class="shrink-0 w-[84px] sm:w-[96px] aspect-4/5 overflow-hidden rounded-[2px] bg-primary-50"
    >
      <NuxtImg
        provider="odooProvider"
        class="w-full h-full object-cover"
        :src="orderLine.product?.imageUrl ?? ''"
        :alt="orderLine.product?.name ?? ''"
        width="280"
        height="373"
        loading="lazy"
        format="webp"
      />
    </SfLink>

    <div class="flex flex-col flex-1 min-w-0">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <SfLink
            :tag="NuxtLink"
            :to="mountUrlSlugForProductVariant(orderLine.product as Product)"
            variant="secondary"
            class="no-underline text-[15px] font-medium leading-snug"
          >
            {{ orderLine?.product?.name || orderLine?.name }}
          </SfLink>
          <ul
            v-if="orderLine.product?.variantAttributeValues?.length"
            class="mt-2 text-[12px] tracking-[0.14em] uppercase font-medium space-y-1"
          >
            <li
              v-for="attribute in orderLine.product?.variantAttributeValues"
              :key="attribute.id"
              class="text-primary-400"
            >
              {{ attribute.attribute?.name }}<span class="text-black"> — {{ attribute.name }}</span>
            </li>
          </ul>
        </div>
        <button
          type="button"
          :aria-label="$t('common.removeItem')"
          class="shrink-0 text-primary-400 hover:text-black transition-colors"
          @click="removeItemFromCart(orderLine.id)"
        >
          <SfIconClose size="sm" />
        </button>
      </div>

      <div class="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <UiQuantitySelector
          :model-value="Number(orderLine.quantity)"
          :max-qty="Number(orderLine.product?.stock) || 10"
          @update:model-value="updateItemQuantity(orderLine.id, Number($event))"
        />
        <div class="text-right whitespace-nowrap ml-auto">
          <p class="flex items-baseline justify-end gap-2">
            <span class="text-[16px] font-medium text-black">{{ orderLine.formattedCartPrice }}</span>
            <span
              v-if="orderLine.formattedPriceBeforeDiscount"
              class="text-[14px] text-primary-300 line-through"
            >
              {{ orderLine.formattedPriceBeforeDiscount }}
            </span>
          </p>
          <p
            v-if="orderLine.formattedDiscountAmount"
            class="mt-0.5 text-[13px] text-primary-500"
          >
            {{ $t('common.youSaveAmount', { amount: orderLine.formattedDiscountAmount }) }}
          </p>
        </div>
      </div>
      <!-- Changing or removing this line failed: said under it. -->
      <UiFieldError
        v-if="lineErrors[orderLine.id]"
        class="mt-2"
      >
        {{ $t('shop.cart.lineFailed', { reason: lineErrors[orderLine.id] }) }}
      </UiFieldError>
    </div>
  </div>
</template>
