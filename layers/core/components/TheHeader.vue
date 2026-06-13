<script lang="ts" setup>
const { loadCategoriesForMegaMenu, categoriesForMegaMenu } = useMegaMenuCategories()

provide('categoriesForMegaMenu', categoriesForMegaMenu)

await loadCategoriesForMegaMenu({ filter: {
  parent: true,
  id: null,
} })
</script>

<template>
  <div class="z-100 sticky top-0">
    <HeaderAnnouncement />
    <div class="bg-white/80 backdrop-blur-md backdrop-saturate-150 border-b border-primary-100">
      <HeaderDesktop v-if="$viewport.isGreaterOrEquals('desktopSmall')" />
      <HeaderMobile v-else />
    </div>
  </div>
</template>
