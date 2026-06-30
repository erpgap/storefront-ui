<script lang="ts" setup>
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
  products: {
    type: String,
    required: false,
  },
  excludeId: {
    type: Number,
    required: false,
    default: undefined,
  },
})

const { loadProductTemplateList, productTemplateList }
  = useProductTemplateListForRecentViews()

await loadProductTemplateList(props.excludeId)

const filteredList = computed(() => {
  if (!props.excludeId) return productTemplateList.value
  return productTemplateList.value.filter(
    (p: { firstVariant?: { combinationInfoVariant?: { product_template_id?: number } } }) =>
      p.firstVariant?.combinationInfoVariant?.product_template_id !== props.excludeId,
  )
})
</script>

<template>
  <section v-if="filteredList?.length > 0">
    <LazyProductSlider
      :heading="props.heading"
      :text="props.text"
      :product-template-list="filteredList"
    />
  </section>
</template>

<style>

</style>
