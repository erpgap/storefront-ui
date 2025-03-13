<script setup lang="ts">
import { useWebsiteHomePage } from '~/domains/core/composable/useWebsiteHomePage'
import generateSeo, {SeoEntity} from '~/utils/buildSEOHelper'

const { getWebsiteHomepage, websiteHomepage } = useWebsiteHomePage()

const { list } = useRecentViewProducts()

await getWebsiteHomepage()

useHead(generateSeo<SeoEntity>(websiteHomepage.value, 'Home'))
</script>

<template>
  <MainBanner />
    <LazyDisplay hydrate-on-visible />
  <section class="pb-16">
      <LazyProductSlider
        key="inspired-by-picks"
        heading="Inspired by your picks"
        key-for-composable="inspired-by-picks"
        hydrate-on-visible
      />
  </section>
  <section
    v-if="list?.length > 0"
    class="pb-16"
  >
    <ClientOnly>
      <LazyProductSlider
        key="recent-views"
        heading="Your recent views"
        :ids="list"
        key-for-composable="recent-views"
      />
    </ClientOnly>
  </section>
</template>
