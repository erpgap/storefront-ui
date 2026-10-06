<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'
import { imageProvider } from '~~/app/utils/odooImage'

// CMS-editable via the `editorial` block. Defaults reproduce the previously
// hard-coded copy, so `<BannerRight />` renders as before.
const props = withDefaults(defineProps<{
  eyebrow?: string
  title?: string
  body?: string
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  titleSize?: 'large' | 'regular'
  ctaLabel?: string
  ctaUrl?: string
}>(), {
  eyebrow: 'Our Philosophy',
  title: 'Made from honest materials',
  body: 'Every piece is cut from natural fabrics — organic cotton, pure linen, full-grain leather — chosen to wear in beautifully and feel better with every year.',
  image: '/img/home/editorial.webp',
  imageAlt: 'Made from honest materials',
  imagePosition: 'left',
  titleSize: 'large',
  ctaLabel: 'Discover the Story',
  ctaUrl: '/products',
})

const NuxtLink = resolveComponent('NuxtLink')

// Which half the image sits in. Ordering rather than DOM order keeps the image
// first in the markup, so it is still the LCP candidate the browser preloads.
const imageOrder = computed(() => props.imagePosition === 'right' ? 'md:order-2' : 'md:order-1')
const textOrder = computed(() => props.imagePosition === 'right' ? 'md:order-1' : 'md:order-2')
</script>

<template>
  <section class="grid grid-cols-1 md:grid-cols-2 items-stretch">
    <div :class="imageOrder">
      <NuxtImg
        :src="image"
        :provider="imageProvider(image)"
        :alt="imageAlt"
        width="896"
        height="1152"
        sizes="xs:100vw sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw 2xl:50vw"
        densities="1x"
        class="w-full h-full min-h-[380px] md:min-h-[520px] object-cover object-center"
        loading="lazy"
      />
    </div>
    <div
      class="bg-primary-50 flex flex-col justify-center p-[clamp(40px,6vw,96px)]"
      :class="textOrder"
    >
      <p
        v-if="eyebrow"
        class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-500"
      >
        {{ eyebrow }}
      </p>
      <h2
        class="font-light tracking-[-0.02em] my-5"
        :class="titleSize === 'regular' ? 'text-[clamp(28px,3.4vw,44px)]' : 'text-[clamp(30px,3.6vw,48px)]'"
      >
        {{ title }}
      </h2>
      <p
        class="font-light text-primary-500 max-w-[440px] mb-8"
        :class="titleSize === 'regular' ? 'leading-relaxed' : ''"
      >
        {{ body }}
      </p>
      <SfButton
        v-if="ctaLabel"
        :tag="NuxtLink"
        :to="ctaUrl || '/products'"
        class="self-start min-h-[52px] px-7 gap-3 text-[13px] font-medium"
      >
        {{ ctaLabel }}
        <svg
          width="18"
          height="14"
          viewBox="0 0 18 14"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <path
            d="M1 7h15M11 1l5 6-5 6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </SfButton>
    </div>
  </section>
</template>
