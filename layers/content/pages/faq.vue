<script setup lang="ts">
useHead({
  title: 'FAQ — Alokai',
  meta: [{ name: 'description', content: 'Frequently asked questions about orders, shipping, returns and more.' }],
})

const groups = [
  {
    title: 'Orders',
    items: [
      { q: 'Can I change or cancel my order?', a: 'Orders can be changed or cancelled within one hour of placing them, before they enter our dispatch queue. Contact us as soon as possible and we\'ll do our best to help.' },
      { q: 'How do I track my order?', a: 'Every dispatch email includes a live tracking link — no account required. You can follow your parcel from our warehouse to your door.' },
    ],
  },
  {
    title: 'Shipping',
    items: [
      { q: 'Do you ship internationally?', a: 'Yes, we ship worldwide. Duties and taxes, where applicable, are calculated transparently at checkout. See our Shipping page for delivery estimates.' },
      { q: 'How much is shipping?', a: 'Standard shipping is complimentary on orders over $150, and a flat $8 below that. Express and international rates are shown at checkout.' },
    ],
  },
  {
    title: 'Returns',
    items: [
      { q: 'What is your return policy?', a: 'Return any unworn item with its original tags within 30 days for a full refund or exchange. Final-sale items and gift cards are excluded.' },
      { q: 'When will I be refunded?', a: 'Refunds are issued to your original payment method within 5 business days of your return arriving back with us.' },
    ],
  },
  {
    title: 'Products & care',
    items: [
      { q: 'What materials do you use?', a: 'Our pieces are cut from natural fabrics — organic cotton, pure linen and full-grain leather — chosen to wear in beautifully over time.' },
      { q: 'How should I care for my pieces?', a: 'Care instructions are printed on each garment\'s label. As a rule, cooler washes and air-drying keep natural fibres looking their best for longer.' },
    ],
  },
]
</script>

<template>
  <div>
    <ContentHero
      eyebrow="Help"
      title="Frequently asked questions"
      subtitle="Everything you need to know about ordering, shipping and returns."
      image="/img/content/faq-banner.webp"
    />

    <div class="narrow-container py-[clamp(48px,7vw,96px)] max-w-[820px]">
      <ContentDemoNote class="mb-12" />

      <div class="space-y-14">
        <section v-for="group in groups" :key="group.title">
          <h2 class="text-[13px] tracking-[0.16em] uppercase font-medium text-primary-400 mb-2">
            {{ group.title }}
          </h2>
          <div class="border-t border-primary-100">
            <details
              v-for="item in group.items"
              :key="item.q"
              class="group border-b border-primary-100"
            >
              <summary
                class="flex items-center justify-between gap-6 py-5 cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden"
              >
                <span class="font-medium text-[16px]">{{ item.q }}</span>
                <svg
                  class="shrink-0 transition-transform duration-300 group-open:rotate-45 text-primary-400"
                  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                >
                  <path d="M12 5v14M5 12h14" stroke-linecap="round" />
                </svg>
              </summary>
              <p class="pb-5 -mt-1 text-primary-500 font-light leading-relaxed max-w-[640px]">
                {{ item.a }}
              </p>
            </details>
          </div>
        </section>
      </div>

      <p class="mt-16 text-primary-600 font-light">
        Still stuck? Reach the team via our
        <NuxtLink to="/contact" class="underline hover:text-black">contact details</NuxtLink>.
      </p>
    </div>
  </div>
</template>
