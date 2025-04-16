<script setup lang="ts">
import type { QueryProductsArgs } from '~/graphql';
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'

const { getWebsiteHomepage, websiteHomepage } = useWebsiteHomePage()

const { list } = useRecentViewProducts()

const { loadProductTemplateList, loading, productTemplateList } = useProductTemplateList('inspired-by-picks', 'inspired-by-picks')

const numOfProducts = 10
const params: QueryProductsArgs = { pageSize: numOfProducts }

if (list.value.length > 0) {
  params.filter = { ids: list.value } as any
}

await loadProductTemplateList(params, true)
await getWebsiteHomepage()

useHead(generateSeo<SeoEntity>(websiteHomepage.value, 'Home'))
</script>

<template>
  <MainBanner />
  <LazyDisplay hydrate-on-visible />
  <section class="pb-16">
    <ProductSlider
      key="inspired-by-picks"
      heading="Inspired by your picks"
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
        :product-template-list="productTemplateList"
      />
    </ClientOnly>
  </section>
</template>
