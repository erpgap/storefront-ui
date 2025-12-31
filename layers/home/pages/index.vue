<script setup lang="ts">
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'

const { getWebsiteHomepage, websiteHomepage } = useWebsiteHomePage()

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
