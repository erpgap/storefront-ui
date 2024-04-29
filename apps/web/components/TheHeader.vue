<script lang="ts" setup>
const { isMobile, isDesktopOrTablet } = useDevice();
const { loadCategoryList } = useCategory();
const { loadWishlist } = useWishlist();

await loadCategoryList({ filter: { parent: true } } as any);

onMounted(async () => {
  await loadWishlist();
});
</script>

<template>
  <HeaderDesktop v-if="isDesktopOrTablet" />
  <HeaderMobile v-if="isMobile" />
</template>
