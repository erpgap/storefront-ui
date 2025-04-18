<script lang="ts" setup>
import { SfButton, SfIconArrowBack } from '@storefront-ui/vue'
import Discount from '~/domains/core/components/ui/Discount.vue'

const NuxtLink = resolveComponent('NuxtLink')
const { cart, loadCart } = useCart()

await loadCart()
</script>

<template>
  <div
    v-if="cart?.order?.websiteOrderLine?.length > 0"
    class="pb-20"
  >
    <div class="flex justify-between mt-8 mb-10">
      <h1 class="font-bold typography-headline-3 md:typography-headline-2">
        Cart
      </h1>
      <SfButton
        to="/cart"
        class="flex md:hidden whitespace-nowrap"
        size="sm"
        variant="tertiary"
      >
        <template #prefix>
          <SfIconArrowBack />
        </template>
        {{ $t('back') }}
      </SfButton>
      <SfButton
        to="/category/15"
        class="hidden md:flex"
        variant="tertiary"
        :tag="NuxtLink"
      >
        <template #prefix>
          <SfIconArrowBack />
        </template>
        {{ $t('backToShopping') }}
      </SfButton>
    </div>
    <div
      class="lg:grid lg:grid-cols-12 md:gap-x-6"
      data-testid="cart-page-content"
    >
      <div class="col-span-7 mb-10 lg:mb-0">
        <div
          v-for="orderLine in cart.order?.websiteOrderLine"
          :key="orderLine?.id"
        >
          <CartCollectedProductCard :order-line="orderLine" />
        </div>
      </div>
      <div class="col-span-5 md:sticky md:top-20 h-fit">
        <Discount />
        <UiOrderSummary :cart="cart">
          <NuxtLink to="/checkout">
            <SfButton
              size="lg"
              class="w-full mb-4 md:mb-0"
            >
              {{ $t('goToCheckout') }}
            </SfButton>
          </NuxtLink>
        </UiOrderSummary>
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex items-center justify-center flex-col pt-24 pb-32"
    data-testid="cart-page-content"
  >
    <NuxtImg
      src="/images/empty-cart.svg"
      :alt="$t('emptyCartImgAlt')"
      width="192"
      height="192"
      loading="lazy"
    />
    <h2 class="mt-8">
      {{ $t('emptyCart') }}
    </h2>
  </div>
</template>
