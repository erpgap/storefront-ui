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
    class="narrow-container pb-20"
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
        <div class="border-t border-primary-100 divide-y divide-primary-100">
          <CartCollectedProductCard
            v-for="orderLine in cart.order?.websiteOrderLine"
            :key="orderLine?.id"
            :order-line="orderLine"
          />
        </div>
      </div>
      <div class="col-span-5 md:sticky md:top-36 h-fit">
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
        <UiDiscount />
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
      class="lg:mx-4 mt-36"
    >
      <LazyProductRecentViewSlider
        text="Your recent views"
      />
    </section>
  </div>
  <div
    v-else
    class="narrow-container py-[clamp(56px,12vh,150px)]"
    data-testid="cart-page-content"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-16 max-w-[940px] mx-auto">
      <!-- Image -->
      <div class="order-1 md:order-2 flex justify-center">
        <NuxtImg
          src="/img/content/empty-cart.png"
          alt=""
          aria-hidden="true"
          class="w-[240px] h-[240px] lg:w-[300px] lg:h-[300px] object-contain drop-shadow-[0_24px_28px_rgba(0,0,0,0.16)]"
          loading="lazy"
        />
      </div>

      <!-- Text -->
      <div class="order-2 md:order-1 text-center md:text-left">
        <p class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400 mb-4">
          Your bag
        </p>
        <h1 class="font-light tracking-[-0.02em] text-[clamp(30px,3.6vw,48px)]">
          Your cart is empty
        </h1>
        <p class="mt-5 text-primary-500 font-light leading-relaxed max-w-[380px] mx-auto md:mx-0">
          Looks like you haven't added anything yet — let's find something you'll love.
        </p>
        <div class="mt-9 flex flex-wrap justify-center md:justify-start gap-3">
          <SfButton
            :tag="NuxtLink"
            to="/products"
            class="min-h-[52px] px-7 text-[13px] font-medium"
          >
            Browse products
          </SfButton>
          <SfButton
            :tag="NuxtLink"
            to="/"
            variant="tertiary"
            class="min-h-[52px] px-7 text-[13px] tracking-[0.1em] uppercase font-medium !border !border-primary-200 !text-black hover:!bg-transparent hover:!border-black"
          >
            Back to home
          </SfButton>
        </div>
      </div>
    </div>
  </div>
</template>
