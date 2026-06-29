<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

const NuxtLink = resolveComponent('NuxtLink')

useHead({
  title: 'About — Alokai by ERPGAP',
  meta: [{ name: 'description', content: 'Alokai is a showcase storefront built by ERPGAP, connecting Odoo to a modern headless commerce experience.' }],
})

const pillars = [
  {
    title: 'Odoo at the core',
    text: 'ERPGAP are Odoo specialists. Alokai plugs a modern storefront straight into Odoo for catalog, pricing, inventory and orders — one source of truth.',
  },
  {
    title: 'Headless & fast',
    text: 'Built on Nuxt and the Alokai (Vue Storefront) framework for a fast, SEO-friendly, fully customisable shopping experience.',
  },
  {
    title: 'Open & extensible',
    text: 'A composable architecture you own end to end — themeable, API-first, and ready to grow with your business.',
  },
]

const stats = [
  { value: '10+', label: 'Years with Odoo' },
  { value: '100%', label: 'Composable & headless' },
  { value: '∞', label: 'Customisable' },
]
</script>

<template>
  <div>
    <ContentHero
      eyebrow="About"
      title="Built by ERPGAP"
      subtitle="Alokai is a showcase storefront connecting Odoo to a modern, headless shopping experience."
      image="/img/content/about-banner.webp"
    />

    <!-- Intro -->
    <section class="narrow-container py-[clamp(56px,8vw,120px)] max-w-[820px]">
      <p class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400 mb-5">
        Our story
      </p>
      <p class="text-[clamp(20px,2.4vw,30px)] font-light leading-snug tracking-[-0.01em]">
        ERPGAP helps businesses run on Odoo — and sell beautifully on top of it. Alokai is our
        open storefront that proves how good headless commerce on Odoo can look and feel.
      </p>
    </section>

    <!-- Pillars -->
    <section class="border-y border-primary-100">
      <div class="narrow-container grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-x-12 py-[clamp(48px,6vw,88px)]">
        <div v-for="(pillar, i) in pillars" :key="pillar.title">
          <span class="block text-[13px] font-medium text-primary-300 mb-4">0{{ i + 1 }}</span>
          <h3 class="text-[20px] font-medium mb-3">{{ pillar.title }}</h3>
          <p class="text-primary-500 font-light leading-relaxed">{{ pillar.text }}</p>
        </div>
      </div>
    </section>

    <!-- Editorial split -->
    <section class="grid grid-cols-1 md:grid-cols-2 items-stretch">
      <NuxtImg
        src="/img/content/about-editorial.webp"
        alt="Crafted commerce"
        width="896"
        height="1088"
        sizes="xs:100vw sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw 2xl:50vw"
        densities="1x"
        class="w-full h-full min-h-[360px] md:min-h-[520px] object-cover object-center"
        loading="lazy"
      />
      <div class="bg-primary-50 flex flex-col justify-center p-[clamp(40px,6vw,96px)]">
        <p class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-500">
          The showcase
        </p>
        <h2 class="font-light tracking-[-0.02em] text-[clamp(28px,3.4vw,44px)] my-5">
          Commerce, the composable way
        </h2>
        <p class="font-light text-primary-500 max-w-[440px] mb-8 leading-relaxed">
          Everything you see here — the catalog, cart, search and checkout — is powered by Odoo
          through the Alokai framework. It's a template you can make entirely your own.
        </p>
        <SfButton
          :tag="NuxtLink"
          to="/products"
          class="self-start min-h-[52px] px-7 gap-3 text-[13px] font-medium"
        >
          Explore the store
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6">
            <path d="M1 7h15M11 1l5 6-5 6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </SfButton>
      </div>
    </section>

    <!-- Stats -->
    <section class="narrow-container py-[clamp(48px,6vw,88px)]">
      <div class="grid grid-cols-3 gap-6 text-center">
        <div v-for="stat in stats" :key="stat.label">
          <div class="text-[clamp(32px,5vw,56px)] font-light tracking-[-0.02em]">{{ stat.value }}</div>
          <div class="text-[12px] tracking-[0.14em] uppercase text-primary-400 mt-2">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Contact / CTA -->
    <section class="border-t border-primary-100">
      <div class="narrow-container py-[clamp(48px,7vw,96px)] max-w-[820px]">
        <ContentDemoNote class="mb-12" />
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <h2 class="font-light tracking-[-0.02em] text-[clamp(26px,3vw,40px)] mb-4">
              Work with ERPGAP
            </h2>
            <p class="text-primary-500 font-light leading-relaxed max-w-[440px]">
              Want a storefront like this on your own Odoo? We'd love to talk.
              Reach us at
              <a href="mailto:info@erpgap.com" class="underline hover:text-black">info@erpgap.com</a>.
            </p>
          </div>
          <SfButton
            :tag="NuxtLink"
            to="https://www.erpgap.com/"
            class="shrink-0 min-h-[52px] px-7 gap-3 text-[13px] font-medium"
            target="_blank"
            rel="noopener"
          >
            Visit erpgap.com
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M1 7h15M11 1l5 6-5 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </SfButton>
        </div>
      </div>
    </section>
  </div>
</template>
