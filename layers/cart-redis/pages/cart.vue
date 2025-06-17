<script lang="ts" setup>
import { SfButton, SfIconArrowBack, SfLoaderCircular } from '@storefront-ui/vue'
import { useCart } from '../composables/useCart'

const NuxtLink = resolveComponent('NuxtLink')
const { cart, loading, loadCart, frequentlyTogetherProducts } = useCart()

await loadCart()
</script>

<template>
  <div
    v-if="loading"
    class="w-full flex flex-col items-center justify-center min-h-[60vh]"
  >
    <SfLoaderCircular
      size="xl"
      class="my-32"
    />
  </div>
  <div
    v-else-if="cart?.order?.websiteOrderLine?.length ?? 0 > 0"
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
        to="/"
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
        <UiDiscount />
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
    <section
      v-if="frequentlyTogetherProducts?.length > 0"
      class="lg:mx-4 mt-36"
    >
      <LazyProductSlider
        heading="Frequently bought together"
        text="You may also like"
        :product-template-list="frequentlyTogetherProducts"
      />
    </section>
    <section
      v-if="(cart.order?.websiteOrderLine?.length ?? 0) > 0"
      class="lg:mx-4 mt-36"
    >
      <LazyProductSlider
        heading="Frequently bought together"
        text="You may also like"
        :product-template-list="frequentlyTogetherProducts"
      />
    </section>
    <section
      class="lg:mx-4 mt-36"
    >
      <LazyProductRecentViewSlider
        text="Your recent views"
      />
    </section>
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
