<script lang="ts" setup>
const NuxtLink = resolveComponent('NuxtLink')

const categories = [
  { name: 'Women', image: '/img/home/cat_women_sand.webp', link: '/women' },
  { name: 'Men', image: '/img/home/cat_men_sand.webp', link: '/men' },
  { name: 'Accessories', image: '/img/home/cat_accessories_sand.webp', link: '/women/accessories' },
]
</script>

<template>
  <section class="narrow-container py-[clamp(64px,9vw,132px)]">
    <div class="flex items-end justify-between gap-6 mb-12">
      <div>
        <p class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400 mb-3.5">
          Browse
        </p>
        <h2 class="font-light tracking-[-0.02em] text-[clamp(28px,3.4vw,44px)]">
          Shop by Category
        </h2>
      </div>
      <NuxtLink
        to="/products"
        class="group hidden sm:inline-flex items-center gap-2 pb-2 text-[13px] tracking-[0.1em] uppercase text-primary-600 whitespace-nowrap border-b border-transparent transition-colors hover:text-black hover:border-black"
      >
        All categories
        <svg width="16" height="12" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M1 7h15M11 1l5 6-5 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NuxtLink
        v-for="category in categories"
        :key="category.name"
        :to="category.link"
        class="group relative block overflow-hidden rounded-[3px]"
      >
        <NuxtImg
          :src="category.image"
          :alt="category.name"
          class="w-full aspect-[4/5] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 text-white bg-gradient-to-t from-black/55 to-transparent">
          <span class="text-[19px] font-medium">{{ category.name }}</span>
          <span class="grid place-items-center w-[38px] h-[38px] rounded-full border border-white/50 transition-colors duration-300 group-hover:bg-white group-hover:text-black">
            <svg width="14" height="11" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M1 7h15M11 1l5 6-5 6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
