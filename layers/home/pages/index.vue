<script setup lang="ts">
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'
import { useWebsiteHomePage } from '~~/layers/core/composables/useWebsiteHomePage.ts'

const { getWebsiteHomepage, websiteHomepage } = useWebsiteHomePage()

await getWebsiteHomepage()
useHead(generateSeo<SeoEntity>(websiteHomepage.value, 'Home'))
</script>

<template>
  <div>
    <MainBanner />
    <Categories />
    <BestSellers />
    <BannerRight />
  </div>
</template>
