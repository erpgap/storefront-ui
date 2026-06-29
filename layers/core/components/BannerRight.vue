<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <section class="grid grid-cols-1 md:grid-cols-2 items-stretch">
    <div class="md:order-1">
      <NuxtImg
        src="/img/home/editorial.webp"
        alt="Made from honest materials"
        width="896"
        height="1152"
        sizes="xs:100vw sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw 2xl:50vw"
        densities="1x"
        class="w-full h-full min-h-[380px] md:min-h-[520px] object-cover object-center"
        loading="lazy"
      />
    </div>
    <div class="md:order-2 bg-primary-50 flex flex-col justify-center p-[clamp(40px,6vw,96px)]">
      <p class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-500">
        Our Philosophy
      </p>
      <h2 class="font-light tracking-[-0.02em] text-[clamp(30px,3.6vw,48px)] my-5">
        Made from honest materials
      </h2>
      <p class="font-light text-primary-500 max-w-[440px] mb-8">
        Every piece is cut from natural fabrics — organic cotton, pure linen, full-grain leather — chosen to wear in beautifully and feel better with every year.
      </p>
      <SfButton
        :tag="NuxtLink"
        to="/products"
        class="self-start min-h-[52px] px-7 gap-3 text-[13px] font-medium"
      >
        Discover the Story
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M1 7h15M11 1l5 6-5 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </SfButton>
    </div>
  </section>
</template>
