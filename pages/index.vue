<script setup lang="ts">
import { useWebsiteHomePage } from '~/domains/core/composable/useWebsiteHomePage'

const { getWebsiteHomepage, websiteHomepage } = useWebsiteHomePage()

const { list } = useRecentViewProducts()

await getWebsiteHomepage()

useHead(websiteHomepageHead(websiteHomepage.value, ''))
</script>

<template>
  <MainBanner />
  <NuxtLazyHydrate when-visible>
    <LazyDisplay />
  </NuxtLazyHydrate>
  <section class="pb-16">
    <NuxtLazyHydrate when-visible>
      <LazyProductSlider
        key="inspired-by-picks"
        heading="Inspired by your picks"
        key-for-composable="inspired-by-picks"
      />
    </NuxtLazyHydrate>
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
