<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <section class="relative flex items-center overflow-hidden text-white min-h-[min(88vh,760px)]">
    <!-- Background image — this is the LCP element, so it is eager + high
         priority and preloaded WITH fetchpriority (the bare `preload` prop emits
         a <link> without it, which Lighthouse flags).
         `sizes` MUST prefix every breakpoint (xs:/sm:/…): @nuxt/image parses a
         bare "100vw" to a junk key and emits a 1×1 srcset, but prefixed values
         build a proper width ladder (376w…1536w) so mobile downloads ~1280px
         instead of the full 1920 (saves ~56 KB on the LCP). densities="1x" keeps
         it to one candidate per breakpoint (the `w` srcset already handles DPR).
         webp shrinks the 1920×1080 source from ~290 KB to ~124 KB. -->
    <NuxtImg
      src="/img/home/hero.webp"
      alt=""
      aria-hidden="true"
      width="1920"
      height="1080"
      sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw 2xl:100vw"
      densities="1x"
      format="webp"
      quality="72"
      class="absolute inset-0 w-full h-full object-cover object-center"
      loading="eager"
      fetchpriority="high"
      :preload="{ fetchPriority: 'high' }"
    />
    <!-- Scrim -->
    <div class="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

    <!-- Content -->
    <div class="narrow-container relative w-full">
      <div class="max-w-[620px]">
        <p class="text-[12px] tracking-[0.22em] uppercase font-medium text-white/70 mb-5">
          New Collection — {{ new Date().getFullYear() }}
        </p>
        <h1 class="font-light leading-[1.05] tracking-[-0.02em] text-[clamp(40px,6vw,80px)] mb-5">
          Timeless Style, Everyday Ease
        </h1>
        <p class="font-light text-[clamp(16px,1.4vw,19px)] text-white/80 max-w-[460px] mb-9">
          Considered essentials in natural fabrics — cotton, linen and leather — designed to move with you and last beyond the season.
        </p>
        <div class="flex flex-wrap gap-3.5">
          <SfButton
            :tag="NuxtLink"
            to="/products"
            variant="tertiary"
            class="!bg-white !text-black hover:!bg-primary-50 !border-none !ring-0 !shadow-none min-h-[52px] px-7 gap-3 text-[13px] tracking-[0.12em] uppercase font-medium"
          >
            Shop Top Sellers
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M1 7h15M11 1l5 6-5 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </SfButton>
          <SfButton
            :tag="NuxtLink"
            to="/products"
            class="min-h-[52px] px-7 text-[13px] font-medium"
          >
            View All Products
          </SfButton>
        </div>
      </div>
    </div>
  </section>
</template>
