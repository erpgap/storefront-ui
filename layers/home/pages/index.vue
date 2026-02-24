<script setup lang="ts">
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'
import { useMegaMenuCategories } from '~~/layers/core/composables/useMegaMenuCategories'

const { getWebsiteHomepage, websiteHomepage } = useWebsiteHomePage()
const { categoriesForMegaMenu } = useMegaMenuCategories()

await getWebsiteHomepage()
useHead(generateSeo<SeoEntity>(websiteHomepage.value, 'Home'))
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
