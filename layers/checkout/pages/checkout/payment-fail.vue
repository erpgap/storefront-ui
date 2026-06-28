<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

const { loadCart } = useCart()

// The order wasn't placed, so the cart still holds the items — refresh it.
await loadCart(false)
</script>

<template>
  <div class="narrow-container">
    <div class="max-w-[560px] mx-auto text-center py-20 md:py-28">
      <span class="mx-auto mb-8 grid place-items-center w-16 h-16 rounded-full border border-red-200 bg-red-50 text-red-600">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M8 8l8 8M16 8l-8 8" stroke-linecap="round" />
        </svg>
      </span>

      <p class="text-[13px] tracking-[0.18em] uppercase text-primary-500 mb-3">
        {{ $t('paymentFail.eyebrow') }}
      </p>
      <h1 class="font-bold typography-headline-3 md:typography-headline-2 mb-4">
        {{ $t('paymentFail.heading') }}
      </h1>
      <p class="text-primary-600 leading-relaxed">
        {{ $t('paymentFail.message') }}
      </p>

      <div class="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <SfButton
          size="lg"
          @click="navigateTo('/checkout')"
        >
          {{ $t('paymentFail.tryAgain') }}
        </SfButton>
        <SfButton
          size="lg"
          variant="secondary"
          @click="navigateTo('/cart')"
        >
          {{ $t('paymentFail.returnToCart') }}
        </SfButton>
      </div>

      <p class="mt-8 text-[13px] text-primary-500">
        {{ $t('paymentFail.needHelp') }}
        <NuxtLink
          to="/contact"
          class="underline underline-offset-4 hover:text-black"
        >
          {{ $t('paymentFail.contactSupport') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
