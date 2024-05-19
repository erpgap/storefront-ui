<script lang="ts" setup>
const { isMobile, isDesktopOrTablet } = useDevice();
const { loadCategoryList, categories } = useCategory();

provide(
  "filteredTopCategories",
  categories.value?.filter(
    (category: any) => category.name === "WOMEN" || category.name === "MEN"
  )
);

await loadCategoryList({ filter: { parent: true } } as any);
</script>

<template>
  <HeaderDesktop v-show="isDesktopOrTablet" />
  <HeaderMobile v-show="isMobile" />
</template>
