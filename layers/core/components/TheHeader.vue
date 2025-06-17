<script lang="ts" setup>
const { loadCategoriesForMegaMenu, categoriesForMegaMenu } = useMegaMenuCategories()

provide('categoriesForMegaMenu', categoriesForMegaMenu)

await loadCategoriesForMegaMenu({ filter: { parent: true }, pageSize: 4 })
</script>

<template>
  <HeaderDesktop v-if="$viewport.isGreaterOrEquals('desktop')" />
  <HeaderMobile v-else />
</template>
