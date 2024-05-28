<script lang="ts" setup>
const { isMobile, isDesktopOrTablet } = useDevice();
const { loadCategoryList, categories } = useCategory();
const { loadCart } = useCart();

provide(
  "filteredTopCategories",
  categories.value?.filter(
    (category: any) => category.name === "WOMEN" || category.name === "MEN"
  )
);

await loadCategoryList({ filter: { parent: true } } as any);
await loadCart();
</script>

<template>
  <HeaderDesktop v-if="isDesktopOrTablet" />
  <HeaderMobile v-if="isMobile" />
</template>
