<script setup lang="ts">
const { loadCategoryList, categories } = useCategory();

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
      <LazyProductSlider heading="Inspired by your picks" />
    </NuxtLazyHydrate>
  </section>
</template>
