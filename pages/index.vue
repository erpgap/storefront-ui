<script setup lang="ts">
const { loadCategoryList, categories } = useCategory();

const { list } = useRecentViewProducts();

await loadCategoryList({ filter: { parent: true } });
</script>

<template>
  <MainBanner />
  <CategoryCard :categories="categories" />
  <NuxtLazyHydrate when-visible>
    <LazyDisplay />
  </NuxtLazyHydrate>
  <section class="pb-16">
    <NuxtLazyHydrate when-visible>
      <LazyProductSlider
        heading="Inspired by your picks"
        key="inspired-by-picks"
        key-for-composable="inspired-by-picks"
      />
    </NuxtLazyHydrate>
  </section>
  <section class="pb-16" v-if="list?.length > 0">
    <ClientOnly>
      <LazyProductSlider
        heading="Your recent views"
        :ids="list"
        key="recent-views"
        key-for-composable="recent-views"
      />
    </ClientOnly>
  </section>
</template>
