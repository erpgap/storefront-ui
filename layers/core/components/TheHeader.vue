<script lang="ts" setup>
const { loadCategoriesForMegaMenu, categoriesForMegaMenu } = useMegaMenuCategories()
const { loadWebsiteMenu } = useWebsiteMenu()
const { loadWebsiteFooter } = useWebsiteFooter()

provide('categoriesForMegaMenu', categoriesForMegaMenu)

// The menu is the one edited in Odoo (Website > Menus). The footer's links
// too, for the mobile menu (one request: the footer asks with the same key).
// The categories are still loaded: the category filter sidebar reads them.
await Promise.all([
  loadWebsiteMenu(),
  loadWebsiteFooter(),
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
