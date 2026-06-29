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
    <!-- MainBanner is the hero (above the fold) — hydrate normally. Everything
         below is server-rendered for SEO but defers client hydration until it
         scrolls into view, cutting initial main-thread work / unused JS. -->
    <MainBanner />
    <LazyCategories hydrate-on-visible />
    <LazyBestSellers hydrate-on-visible />
    <LazyBannerRight hydrate-on-visible />
    <LazyValueProps hydrate-on-visible />
  </div>
</template>
