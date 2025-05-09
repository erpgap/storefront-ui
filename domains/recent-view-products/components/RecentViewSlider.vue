<script lang="ts" setup>
import type { QueryProductsArgs } from '~/graphql'

const props = defineProps({
  heading: {
    type: String,
    default: '',
    required: false,
  },
  text: {
    type: String,
    default: '',
    required: false,
  },
})

const { list } = useRecentViewProducts()
const { loadProductTemplateList, productTemplateList } = useProductTemplateList('recent-views')

const numOfProducts = 10
const params: QueryProductsArgs = { pageSize: numOfProducts }

if (list.value?.length > 0) {
  params.filter = { ids: list.value } as any
}

await loadProductTemplateList(params)
</script>

<template>
  <section v-if="list?.length > 0">
    <LazyProductSlider
      :heading="props.heading"
      :text="props.text"
      :product-template-list="productTemplateList"
    />
  </section>
</template>

<style>

</style>
