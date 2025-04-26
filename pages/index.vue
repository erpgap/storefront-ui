<script setup lang="ts">
import type { QueryProductsArgs } from '~/graphql'
import generateSeo, { type SeoEntity } from '~/utils/buildSEOHelper'

const { getWebsiteHomepage, websiteHomepage } = useWebsiteHomePage()

const { list } = useRecentViewProducts()

const { loadProductTemplateList, productTemplateList } = useProductTemplateList('recent-views', 'recent-views')

const numOfProducts = 10
const params: QueryProductsArgs = { pageSize: numOfProducts }

if (list.value?.length > 0) {
  params.filter = { ids: list.value } as any
}

await loadProductTemplateList(params, true)
await getWebsiteHomepage()

useHead(generateSeo<SeoEntity>(websiteHomepage.value, 'Home'))
</script>

<template>
  <div>
    <MainBanner />
    <LazyDisplay hydrate-on-visible />
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
  </div>
</template>
