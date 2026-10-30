<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'
import { imageProvider } from '#cms/utils/media'

// CMS-editable via the `hero` block (layers/cms-blocks/schemas.ts). Every
// prop defaults to the copy that used to be hard-coded here, so
// `<MainBanner />` with no props renders exactly as before — the existing homepage needs no change.
interface Cta {
  label?: string
  url?: string
  style?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<{
  eyebrow?: string
  title?: string
  body?: string
  image?: string
  ctas?: Cta[]
}>(), {
  eyebrow: undefined,
  title: undefined,
  body: undefined,
  image: '/img/home/hero.webp',
  ctas: undefined,
})

const NuxtLink = resolveComponent('NuxtLink')
const { t } = useI18n()

// A prop left out falls back to the default copy (translated, so it cannot be a
// withDefaults value); an empty string from the CMS still renders nothing.
const titleText = computed(() => props.title !== undefined ? props.title : t('core.home.hero.title'))
const bodyText = computed(() => props.body !== undefined ? props.body : t('core.home.hero.body'))

// The year was interpolated in the template, so it cannot live in a static
// default. Only an absent prop gets it: an empty string from the CMS means
// the merchant cleared the line, so nothing renders.
const eyebrowText = computed(
  () => props.eyebrow ?? t('core.home.hero.eyebrow', { year: new Date().getFullYear() }),
)

const ctaList = computed<Cta[]>(() => props.ctas ?? [
  { label: t('core.home.hero.primaryCta'), url: '/products', style: 'primary' },
  { label: t('core.home.hero.secondaryCta'), url: '/products', style: 'secondary' },
])
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
    <!-- v-if, because the CMS drives this block and an image field is blank
         until a merchant picks one. A NuxtImg with an empty src renders a
         broken-image icon, which looks like a fault rather than an empty
         field. -->
    <NuxtImg
      v-if="image"
      :src="image"
      :provider="imageProvider(image)"
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
    <div
      v-else
      class="absolute inset-0 bg-primary-100"
    />
    <!-- Scrim -->
    <div class="absolute inset-0 bg-linear-to-r from-black/55 via-black/25 to-transparent" />

    <!-- Content -->
    <div class="narrow-container relative w-full">
      <div class="max-w-[620px]">
        <p
          v-if="eyebrowText"
          class="text-[12px] tracking-[0.22em] uppercase font-medium text-white/70 mb-5"
        >
          {{ eyebrowText }}
        </p>
        <h1 class="font-light leading-[1.05] tracking-[-0.02em] text-[clamp(40px,6vw,80px)] mb-5">
          {{ titleText }}
        </h1>
        <p class="font-light text-[clamp(16px,1.4vw,19px)] text-white/80 max-w-[460px] mb-9">
          {{ bodyText }}
        </p>
        <div class="flex flex-wrap gap-3.5">
          <SfButton
            v-for="(cta, index) in ctaList"
            :key="index"
            :tag="NuxtLink"
            :to="cta.url || '/products'"
            :variant="cta.style === 'secondary' ? undefined : 'tertiary'"
            :class="cta.style === 'secondary'
              ? 'min-h-[52px] px-7 text-[13px] font-medium'
              : 'bg-white! text-black! hover:bg-primary-50! border-none! ring-0! shadow-none! min-h-[52px] px-7 gap-3 text-[13px] tracking-[0.12em] uppercase font-medium'"
          >
            {{ cta.label }}
            <UiIconArrowRight v-if="cta.style !== 'secondary'" />
          </SfButton>
        </div>
      </div>
    </div>
  </section>
</template>
