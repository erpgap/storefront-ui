<script setup lang="ts">
useHead({
  title: 'Stores — Alokai',
  meta: [{ name: 'description', content: 'Visit an Alokai flagship store.' }],
})

const stores = [
  { city: 'Lisbon', address: 'Rua Garrett 42, 1200-203 Lisboa', hours: 'Mon–Sat 10–20 · Sun 12–18', image: '/img/content/store-lisbon.jpg' },
  { city: 'London', address: '18 Redchurch Street, Shoreditch, E2 7DJ', hours: 'Mon–Sat 10–19 · Sun 11–17', image: '/img/content/store-london.jpg' },
  { city: 'New York', address: '76 Greene Street, SoHo, NY 10012', hours: 'Mon–Sun 11–20', image: '/img/content/store-newyork.jpg' },
]
</script>

<template>
  <div>
    <ContentHero
      eyebrow="Visit us"
      title="Our stores"
      subtitle="Come see the collection in person at one of our flagship locations."
      image="/img/content/stores-banner.jpg"
    />

    <div class="narrow-container py-[clamp(48px,7vw,96px)]">
      <ContentDemoNote class="mb-12 max-w-[820px]" />

      <div class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
        <article v-for="store in stores" :key="store.city">
          <div class="overflow-hidden rounded-[3px] mb-5">
            <NuxtImg
              :src="store.image"
              :alt="store.city"
              class="w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
          </div>
          <h2 class="text-[22px] font-light tracking-[-0.01em] mb-3">{{ store.city }}</h2>
          <p class="text-primary-500 font-light">{{ store.address }}</p>
          <p class="text-[13px] tracking-[0.06em] uppercase text-primary-400 mt-3">{{ store.hours }}</p>
        </article>
      </div>

      <p class="mt-14 text-primary-500 font-light max-w-[820px]">
        Can't make it in? You can shop the full collection
        <NuxtLink to="/products" class="underline hover:text-black">online</NuxtLink>, with
        complimentary shipping over $150.
      </p>
    </div>
  </div>
</template>
