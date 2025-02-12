<script lang="ts" setup>
import { useMegaMenuCategories } from '../composable/useMegaMenuCategories';

const { isMobile, isDesktopOrTablet } = useDevice();
const { loadCategoriesForMegaMenu, categoriesForMegaMenu } = useMegaMenuCategories();


provide(
  "categoriesForMegaMenu",
  categoriesForMegaMenu
);

await loadCategoriesForMegaMenu({ filter: { parent: true }, pageSize: 4 });
</script>

<template>
  <HeaderDesktop v-if="isDesktopOrTablet" />
  <HeaderMobile v-if="isMobile" />
</template>
