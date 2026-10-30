<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'
import { imageProvider } from '#cms/utils/media'

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
  eyebrow: undefined,
  title: undefined,
  body: undefined,
  image: '/img/home/editorial.webp',
  imageAlt: undefined,
  imagePosition: 'left',
  titleSize: 'large',
  ctaLabel: undefined,
  ctaUrl: '/products',
})

const NuxtLink = resolveComponent('NuxtLink')
const { t } = useI18n()

// A prop left out falls back to the default copy (translated, so it cannot be a
// withDefaults value); an empty string from the CMS still renders nothing.
const eyebrowText = computed(() => props.eyebrow !== undefined ? props.eyebrow : t('core.home.editorial.eyebrow'))
const titleText = computed(() => props.title !== undefined ? props.title : t('core.home.editorial.title'))
const bodyText = computed(() => props.body !== undefined ? props.body : t('core.home.editorial.body'))
const imageAltText = computed(() => props.imageAlt !== undefined ? props.imageAlt : t('core.home.editorial.title'))
const ctaLabelText = computed(() => props.ctaLabel !== undefined ? props.ctaLabel : t('core.home.editorial.ctaLabel'))

// Which half the image sits in. Ordering rather than DOM order keeps the image
// first in the markup, so it is still the LCP candidate the browser preloads.
const imageOrder = computed(() => props.imagePosition === 'right' ? 'md:order-2' : 'md:order-1')
const textOrder = computed(() => props.imagePosition === 'right' ? 'md:order-1' : 'md:order-2')
</script>

<template>
  <section class="grid grid-cols-1 md:grid-cols-2 items-stretch">
    <div :class="imageOrder">
      <!-- Same reason as MainBanner: blank while a merchant is still filling
           the block in, and an empty src draws a broken-image icon. -->
      <NuxtImg
        v-if="image"
        :src="image"
        :provider="imageProvider(image)"
        :alt="imageAltText"
        width="896"
        height="1152"
        sizes="xs:100vw sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw 2xl:50vw"
        densities="1x"
        class="w-full h-full min-h-[380px] md:min-h-[520px] object-cover object-center"
        loading="lazy"
      />
      <div
        v-else
        class="w-full h-full min-h-[380px] md:min-h-[520px] bg-primary-100"
      />
    </div>
    <div
      class="bg-primary-50 flex flex-col justify-center p-[clamp(40px,6vw,96px)]"
      :class="textOrder"
    >
      <p
        v-if="eyebrowText"
        class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-500"
      >
        {{ eyebrowText }}
      </p>
      <h2
        class="font-light tracking-[-0.02em] my-5"
        :class="titleSize === 'regular' ? 'text-[clamp(28px,3.4vw,44px)]' : 'text-[clamp(30px,3.6vw,48px)]'"
      >
        {{ titleText }}
      </h2>
      <p
        class="font-light text-primary-500 max-w-[440px] mb-8"
        :class="titleSize === 'regular' ? 'leading-relaxed' : ''"
      >
        {{ bodyText }}
      </p>
      <SfButton
        v-if="ctaLabelText"
        :tag="NuxtLink"
        :to="ctaUrl || '/products'"
        class="self-start min-h-[52px] px-7 gap-3 text-[13px] font-medium"
      >
        {{ ctaLabelText }}
        <UiIconArrowRight />
      </SfButton>
    </div>
  </section>
</template>
