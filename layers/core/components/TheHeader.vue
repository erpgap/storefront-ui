<script lang="ts" setup>
const { loadCategoriesForMegaMenu, categoriesForMegaMenu } = useMegaMenuCategories()

provide('categoriesForMegaMenu', categoriesForMegaMenu)

await loadCategoriesForMegaMenu({ filter: { parent: true }, pageSize: 4 })
</script>

<template>
  <div class="z-100 sticky top-0">
    <HeaderAnnouncement />
    <HeaderDesktop v-if="$viewport.isGreaterOrEquals('desktopSmall')" />
    <HeaderMobile v-else />
  </div>
</template>
