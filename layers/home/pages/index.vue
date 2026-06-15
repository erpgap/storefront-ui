<script setup lang="ts">
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'
import { useWebsiteHomePage } from '~~/layers/core/composables/useWebsiteHomePage.ts'

const { getWebsiteHomepage, websiteHomepage } = useWebsiteHomePage()

await getWebsiteHomepage()
const { origin, pathname } = useRequestURL()
useHead(generateSeo<SeoEntity>(websiteHomepage.value, 'Home', `${origin}${pathname}`))
</script>

<template>
  <div>
    <MainBanner />
    <Categories />
    <BestSellers />
    <BannerRight />
    <ValueProps />
  </div>
</template>
