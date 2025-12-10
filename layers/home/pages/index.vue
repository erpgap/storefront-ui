<script setup lang="ts">
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'
const { loadCategoriesForMegaMenu, categoriesForMegaMenu } = useMegaMenuCategories()

type HomeData = {
  websiteHomepage?: SeoEntity
  categories?: { categories: Array<{ id: string; name: string; slug: string }> }
}

const headers = useRequestHeaders(['cookie'])
const { $sdk } = useNuxtApp() as any

const vars = { currentPage: 1, pageSize: 6 }

const { data, error } = await useAsyncData<HomeData>(
  'home-data',
  () => $sdk().odoo.query({ queryName: 'GetHomePageData' }, vars, { headers }),
  {
    server: true,
    lazy: false,
    dedupe: 'defer',
  }
)

const home = computed(() => data.value?.websiteHomepage ?? null)
await loadCategoriesForMegaMenu({ filter: {
  parent: true,
  id: null
} })

if (home.value) useHead(generateSeo<SeoEntity>(home.value, 'Home'))

if (import.meta.client) {
  console.log('[HOME] payload:', data.value)
  console.log('[HOME] categories:', categoriesForMegaMenu.value)
}
</script>

<template>
  <div>
    <MainBanner />

    <Categories :items="categoriesForMegaMenu" />

    <BannerRight />

    <LazyProductRecentViewSlider heading="Shop our Best Sellers" />

    <BannerLeft />
  </div>
</template>
