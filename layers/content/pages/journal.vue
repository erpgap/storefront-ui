<script setup lang="ts">
useHead({
  title: 'Journal — Alokai',
  meta: [{ name: 'description', content: 'Stories on design, materials and the people behind Alokai.' }],
})

const articles = [
  { category: 'Materials', title: 'Why we choose natural fibres', excerpt: 'Organic cotton, linen and full-grain leather — and how they wear in over time.', date: 'May 2026', image: '/img/content/journal-1.webp' },
  { category: 'Design', title: 'The case for fewer, better pieces', excerpt: 'A look at how a considered wardrobe outlasts the trend cycle.', date: 'Apr 2026', image: '/img/content/journal-2.webp' },
  { category: 'Craft', title: 'Inside our leather workshop', excerpt: 'Meet the makers shaping every bag, by hand, one at a time.', date: 'Mar 2026', image: '/img/content/journal-3.webp' },
  { category: 'Behind the build', title: 'Headless commerce on Odoo', excerpt: 'How ERPGAP connects this storefront to Odoo with the Alokai framework.', date: 'Feb 2026', image: '/img/content/journal-4.webp' },
]
</script>

<template>
  <div>
    <ContentHero
      eyebrow="Journal"
      title="Stories & ideas"
      subtitle="On design, materials and the craft behind every piece."
      image="/img/content/journal-banner.webp"
    />

    <div class="narrow-container py-[clamp(48px,7vw,96px)]">
      <ContentDemoNote class="mb-12 max-w-[820px]" />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-14">
        <article v-for="article in articles" :key="article.title" class="group cursor-pointer">
          <div class="overflow-hidden rounded-[3px] mb-5">
            <NuxtImg
              :src="article.image"
              :alt="article.title"
              width="1344"
              height="768"
              sizes="xs:100vw sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw 2xl:50vw"
              densities="1x"
              class="w-full aspect-[16/10] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div class="flex items-center gap-3 text-[12px] tracking-[0.14em] uppercase text-primary-400 mb-3">
            <span>{{ article.category }}</span>
            <span class="w-1 h-1 rounded-full bg-primary-300" />
            <span>{{ article.date }}</span>
          </div>
          <h2 class="text-[24px] font-light tracking-[-0.01em] mb-2 group-hover:underline underline-offset-4">
            {{ article.title }}
          </h2>
          <p class="text-primary-500 font-light leading-relaxed max-w-[520px]">{{ article.excerpt }}</p>
        </article>
      </div>
    </div>
  </div>
</template>
