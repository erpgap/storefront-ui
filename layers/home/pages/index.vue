<script setup lang="ts">
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'

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

const home       = computed(() => data.value?.websiteHomepage ?? null)
const categories = computed(() => data.value?.categories?.categories ?? [])

if (home.value) useHead(generateSeo<SeoEntity>(home.value, 'Home'))

if (import.meta.client) {
  console.log('[HOME] payload:', data.value)
  console.log('[HOME] categories:', categories.value)
}
</script>

<template>
  <div>
    <MainBanner />

    <Categories :items="categories" />

    <BannerRight />

    <LazyProductRecentViewSlider heading="Shop our Best Sellers" />

    <BannerLeft />
  </div>
</template>
