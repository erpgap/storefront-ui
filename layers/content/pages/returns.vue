<script setup lang="ts">
useHead({
  title: 'Returns & Exchanges — Alokai',
  meta: [{ name: 'description', content: '30-day returns and easy exchanges on Alokai orders.' }],
})

const steps = [
  { n: '01', title: 'Start your return', text: 'Use the link in your dispatch email or contact us — no account needed.' },
  { n: '02', title: 'Pack it up', text: 'Place items back in their original packaging with tags attached.' },
  { n: '03', title: 'Drop it off', text: 'Print the prepaid label and drop your parcel at any partner location.' },
  { n: '04', title: 'Get refunded', text: 'Refunds are issued to your original payment method within 5 business days of arrival.' },
]
</script>

<template>
  <div>
    <ContentHero
      eyebrow="Help"
      title="Returns & Exchanges"
      subtitle="Changed your mind? You have 30 days, on us."
      image="/img/content/returns-banner.jpg"
    />

    <div class="narrow-container py-[clamp(48px,7vw,96px)] max-w-[820px]">
      <ContentDemoNote class="mb-12" />

      <p class="text-[clamp(16px,1.6vw,19px)] font-light text-primary-600 leading-relaxed">
        We want you to love what you ordered. If something isn't right, return any unworn item within
        <span class="text-black">30 days</span> for a full refund or exchange.
      </p>

      <h2 class="mt-14 mb-8 text-[24px] font-light tracking-[-0.01em]">
        How it works
      </h2>
      <ol class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
        <li v-for="step in steps" :key="step.n" class="flex gap-4">
          <span class="text-[13px] font-medium text-primary-300 pt-1">{{ step.n }}</span>
          <div>
            <h3 class="font-medium mb-1.5">{{ step.title }}</h3>
            <p class="text-[14px] text-primary-500 font-light leading-relaxed">{{ step.text }}</p>
          </div>
        </li>
      </ol>

      <h2 class="mt-16 mb-4 text-[24px] font-light tracking-[-0.01em]">
        What can be returned
      </h2>
      <ul class="space-y-2.5 text-primary-600 font-light">
        <li class="flex gap-3"><span class="text-black">·</span> Unworn items with original tags and packaging.</li>
        <li class="flex gap-3"><span class="text-black">·</span> Within 30 days of delivery.</li>
        <li class="flex gap-3"><span class="text-black">·</span> Final-sale items and gift cards are not eligible.</li>
      </ul>

      <p class="mt-12 text-primary-600 font-light leading-relaxed">
        Prefer an exchange? Start a return and pick your new size or colour — we'll ship the
        replacement as soon as your original is on its way back.
        <NuxtLink to="/faq" class="underline hover:text-black">More questions?</NuxtLink>
      </p>
    </div>
  </div>
</template>
