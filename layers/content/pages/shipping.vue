<script setup lang="ts">
useHead({
  title: 'Shipping — Alokai',
  meta: [{ name: 'description', content: 'Shipping options, delivery times and tracking for Alokai orders.' }],
})

const options = [
  { name: 'Standard', time: '3–5 business days', cost: 'Free over $150 · $8 under' },
  { name: 'Express', time: '1–2 business days', cost: '$18 flat' },
  { name: 'International', time: '7–14 business days', cost: 'Calculated at checkout' },
]
</script>

<template>
  <div>
    <ContentHero
      eyebrow="Help"
      title="Shipping & Delivery"
      subtitle="Considered packaging, carbon-aware carriers and tracking on every order."
      image="/img/content/shipping-banner.webp"
    />

    <div class="narrow-container py-[clamp(48px,7vw,96px)] max-w-[820px]">
      <ContentDemoNote class="mb-12" />

      <p class="text-[clamp(16px,1.6vw,19px)] font-light text-primary-600 leading-relaxed">
        We aim to dispatch every order within one business day. You'll receive a confirmation email
        with tracking as soon as your parcel leaves our warehouse.
      </p>

      <h2 class="mt-14 mb-6 text-[24px] font-light tracking-[-0.01em]">
        Delivery options
      </h2>
      <div class="border-t border-primary-100">
        <div
          v-for="option in options"
          :key="option.name"
          class="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-1 sm:gap-6 py-5 border-b border-primary-100"
        >
          <span class="font-medium">{{ option.name }}</span>
          <span class="text-primary-500">{{ option.time }}</span>
          <span class="text-primary-500 sm:text-right">{{ option.cost }}</span>
        </div>
      </div>

      <h2 class="mt-14 mb-4 text-[24px] font-light tracking-[-0.01em]">
        Processing & tracking
      </h2>
      <p class="text-primary-600 font-light leading-relaxed mb-4">
        Orders placed before 1pm local time ship the same day, Monday to Friday. Once dispatched,
        your tracking link stays live until delivery — no account required.
      </p>

      <h2 class="mt-14 mb-4 text-[24px] font-light tracking-[-0.01em]">
        International orders
      </h2>
      <p class="text-primary-600 font-light leading-relaxed">
        We ship worldwide. Duties and import taxes, where they apply, are calculated transparently at
        checkout so there are no surprises on delivery. Still have a question?
        <NuxtLink to="/faq" class="underline hover:text-black">Visit our FAQ</NuxtLink>.
      </p>
    </div>
  </div>
</template>
