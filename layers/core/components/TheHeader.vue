<script lang="ts" setup>
const { loadCategoriesForMegaMenu, categoriesForMegaMenu } = useMegaMenuCategories()
const { loadWebsiteMenu } = useWebsiteMenu()

provide('categoriesForMegaMenu', categoriesForMegaMenu)

// The menu is the one edited in Odoo (Website > Menus). The categories are
// still loaded: the category filter sidebar reads them.
await Promise.all([
  loadWebsiteMenu(),
  loadCategoriesForMegaMenu({ filter: {
    parent: true,
    id: null,
  } }),
])
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
