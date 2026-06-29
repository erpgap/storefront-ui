<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
  image: string
}>()
</script>

<template>
  <section class="relative flex items-center overflow-hidden text-white min-h-[clamp(260px,40vh,440px)]">
    <!-- Full-bleed banner = LCP on content pages. Responsive `sizes` (every
         token breakpoint-prefixed) so mobile doesn't pull the full 1344px file.
         densities="1x" → one candidate per breakpoint; `w` srcset handles DPR.
         Content banners are 1344×768; preload WITH fetchpriority. -->
    <NuxtImg
      :src="image"
      alt=""
      aria-hidden="true"
      width="1344"
      height="768"
      sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw 2xl:100vw"
      densities="1x"
      class="absolute inset-0 w-full h-full object-cover object-center"
      loading="eager"
      fetchpriority="high"
      :preload="{ fetchPriority: 'high' }"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/20" />
    <div class="narrow-container relative w-full py-16">
      <p v-if="eyebrow" class="text-[12px] tracking-[0.22em] uppercase font-medium text-white/70 mb-4">
        {{ eyebrow }}
      </p>
      <h1 class="font-light leading-[1.05] tracking-[-0.02em] text-[clamp(32px,5vw,60px)] max-w-[760px]">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-5 font-light text-white/80 max-w-[560px] text-[clamp(15px,1.4vw,18px)]">
        {{ subtitle }}
      </p>
    </div>
  </section>
</template>
