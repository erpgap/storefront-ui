<script setup lang="ts">
import {
  SfIconRemoveShoppingCart,
  SfIconSell,
  SfLink,
} from '@storefront-ui/vue';
import { type OrderLine, type Product } from '~/graphql';
const NuxtLink = resolveComponent('NuxtLink');

defineProps({
  orderLine: {
    type: Object as PropType<OrderLine>,
    required: true,
  },
});

const { updateItemQuantity, removeItemFromCart } = useCart();
</script>

<template>
  <div
    class="relative flex first:border-t border-b-[1px] border-neutral-200 hover:shadow-lg min-w-[320px] p-4 last:mb-0"
    data-testid="cart-product-card"
  >
    <div class="relative overflow-hidden rounded-md w-[100px] sm:w-[176px]">
      <SfLink
        :to="mountUrlSlugForProductVariant(orderLine.product as Product)"
        :tag="NuxtLink"
      >
        <NuxtImg
          class="w-full h-auto border rounded-md border-neutral-200"
          :src="
            $getImage(
              String(orderLine.product?.image),
              370,
              370,
              String(orderLine.product?.imageFilename)
            )
          "
          :alt="orderLine.product?.imageFilename ?? ''"
          width="300"
          height="300"
          loading="lazy"
          format="webp"
        />
      </SfLink>
      <div
        class="absolute top-0 left-0 text-white bg-secondary-600 py-1 pl-1.5 pr-2 text-xs font-medium"
      >
        <SfIconSell size="xs" class="mr-1" />
        {{ $t('sale') }}
      </div>
    </div>
    <div class="flex flex-col pl-4 min-w-[180px] flex-1">
      <div class="flex justify-between">
        <SfLink
          :tag="NuxtLink"
          :to="mountUrlSlugForProductVariant(orderLine.product as Product)"
          variant="secondary"
          class="no-underline typography-text-sm sm:typography-text-lg cursor-pointer"
        >
          {{ orderLine.product?.name }}
        </SfLink>
        <SfIconRemoveShoppingCart
          class="cursor-pointer"
          @click="removeItemFromCart(orderLine.id)"
        />
      </div>
      <div class="my-2 sm:mb-0">
        <ul
          class="text-xs font-normal leading-5 sm:typography-text-sm text-neutral-700"
        >
          <li
            v-for="attribute in orderLine.product?.variantAttributeValues"
            :key="attribute.id"
          >
            <span class="mr-1">{{ attribute.attribute?.name }}:</span>
            <span class="font-medium">{{ attribute.name }}</span>
          </li>
        </ul>
      </div>
      <div
        class="items-start sm:items-center sm:mt-auto flex flex-col sm:flex-row"
      >
        <span
          v-if="orderLine.priceSubtotal"
          class="text-secondary-700 sm:order-1 font-bold typography-text-sm sm:typography-text-lg sm:ml-auto"
        >
          {{ $currency(orderLine.priceSubtotal) }}
          <span
            class="text-neutral-500 ml-2 line-through typography-text-xs sm:typography-text-sm font-normal"
          >
            {{
              $currency(
                orderLine.product?.combinationInfo?.list_price *
                  orderLine?.quantity
              )
            }}
          </span>
        </span>
        <span
          v-else
          class="font-bold sm:ml-auto sm:order-1 typography-text-sm sm:typography-text-lg"
        >
          {{ $currency(orderLine.priceTotal) }}
        </span>
        <UiQuantitySelector
          v-model="orderLine.quantity"
          :min-value="1"
          :max-value="Number(orderLine.product?.qty)"
          :value="Number(orderLine.quantity)"
          class="mt-4 sm:mt-0"
          @update:model-value="updateItemQuantity(orderLine.id, $event)"
        />
      </div>
    </div>
  </div>
</template>
