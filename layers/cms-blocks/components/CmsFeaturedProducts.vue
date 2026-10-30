<script setup lang="ts">
import type { Product, QueryProductsArgs, ProductTemplateListResponse } from '~~/graphql'
import { QueryName } from '~~/server/queries'

// Renders products the merchant hand-picked.
//
// The block stores ids; everything shown here - name, image, price, stock -
// comes live from Odoo on render. That is the point: a featured block never
// shows last month's price, and no id-sync job exists because the reference
// never left the database it belongs to.
const props = withDefaults(defineProps<{
  eyebrow?: string
  title?: string
  productIds?: number[]
  blockId?: string
}>(), {
  eyebrow: 'Picked for you',
  title: 'Our Favourites',
  productIds: () => [],
  blockId: '',
})

const NuxtLink = resolveComponent('NuxtLink')
const { $sdk } = useNuxtApp() as any

const ids = computed(() => (props.productIds ?? []).map(Number).filter(Boolean))

const { data } = await useAsyncData<ProductTemplateListResponse | null>(
  computed(() => `cms-featured-${props.blockId}-${ids.value.join('-')}`),
  () => {
    // No ids means no query. Asking Odoo for an empty selection would return
    // the whole catalogue.
    if (!ids.value.length) return Promise.resolve(null)

    return $sdk().odoo.query(
      { queryName: QueryName.GetProductTemplateListQueryForRecentViews },
      { filter: { ids: ids.value } } as QueryProductsArgs,
      { headers: useRequestHeaders() },
    )
  },
  { default: () => null, watch: [ids] },
)

// Odoo returns them in its own order; the merchant chose theirs.
//
// Falls back to the response order if the ids cannot be matched. Without that
// a single missing field silently empties the grid, which is how this block
// spent its first outing rendering nothing at all: the query selected
// firstVariant.id but no product-level id, so every comparison was against
// undefined.
const products = computed<Product[]>(() => {
  const found = (data.value?.products?.products ?? []) as Product[]

  const ordered = ids.value
    .map(id => found.find(p => Number(p.id) === id))
    .filter(Boolean) as Product[]

  return ordered.length ? ordered : found
})
</script>

<template>
  <section
    v-if="products.length"
    class="narrow-container py-[clamp(64px,9vw,132px)]"
  >
    <UiSectionHeading
      :eyebrow="eyebrow"
      :title="title"
    />

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-7 gap-y-10">
      <UiProductCard
        v-for="product in products"
        :key="product.id"
        v-bind="productCardProps(product)"
      />
    </div>
  </section>
</template>
