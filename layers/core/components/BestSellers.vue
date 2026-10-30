<script setup lang="ts">
import type { QueryProductsArgs } from '~~/graphql'

// CMS-editable via the `bestSellers` block. The merchant controls the framing
// and the query — heading, how many, what order — but never the product data
// itself, which stays live from the Odoo catalogue. That relational link is
// exactly what a separate headless CMS could not have given us without an
// ID-sync job (see docs/CMS_ARCHITECTURE.md §3).
const props = withDefaults(defineProps<{
  eyebrow?: string
  title?: string
  linkLabel?: string
  linkUrl?: string
  pageSize?: number
  sort?: 'popular' | 'newest' | 'priceAsc' | 'priceDesc'
  /**
   * §9.1: this component used to call useProductTemplateList with the FIXED key
   * 'best-sellers'. Two product blocks on one page would then share one
   * useAsyncData entry and fight over it. BlockRenderer passes the block
   * instance id, so each block gets its own cache entry.
   */
  blockId?: string
}>(), {
  eyebrow: 'Curated',
  title: 'Best Sellers',
  linkLabel: 'View all',
  linkUrl: '/products',
  pageSize: 4,
  sort: 'popular',
  blockId: '',
})

const NuxtLink = resolveComponent('NuxtLink')

const SORTS: Record<string, QueryProductsArgs['sort']> = {
  popular: { popular: 'DESC' } as QueryProductsArgs['sort'],
  newest: { newest: 'DESC' } as QueryProductsArgs['sort'],
  priceAsc: { price: 'ASC' } as QueryProductsArgs['sort'],
  priceDesc: { price: 'DESC' } as QueryProductsArgs['sort'],
}

const { loadProductTemplateList, productTemplateList } = useProductTemplateList(
  props.blockId ? `best-sellers-${props.blockId}` : 'best-sellers',
)

// Clamped server-side too (the `pageSize` field declares min/max), but a
// component that trusts its props to be sane is a component that breaks the
// first time someone calls it from outside the CMS.
const count = computed(() => Math.min(Math.max(Number(props.pageSize) || 4, 1), 12))

function queryArgs() {
  return {
    pageSize: count.value,
    sort: SORTS[props.sort] ?? SORTS.popular,
    // useProductTemplateList is built for listing pages: it derives a
    // categorySlug from the current route. On a CMS page - or in the editor -
    // that means filtering the catalogue by the page's own url, which matches
    // nothing, so the grid renders empty and the block collapses to zero
    // height. This block is a curated grid, not a listing, so it clears it.
    filter: { categorySlug: null },
  } as any
}

await loadProductTemplateList(queryArgs())

// Changing the order or the count changes WHICH products these are, so the
// grid has to go back to Odoo - unlike the headings beside it, which are
// pure presentation and update through reactivity alone. Without this the
// merchant picks "Newest first", sees the same four products, and reasonably
// concludes the setting is broken.
//
// Inert in production, where these props never change after render.
watch(
  () => [count.value, props.sort],
  () => { void loadProductTemplateList(queryArgs()) },
)
</script>

<template>
  <section
    v-if="productTemplateList.length"
    class="narrow-container pb-[clamp(64px,9vw,132px)]"
  >
    <UiSectionHeading
      :eyebrow="eyebrow"
      :title="title"
      :link-label="linkLabel"
      :link-url="linkUrl"
    />

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-7 gap-y-10">
      <UiProductCard
        v-for="product in productTemplateList"
        :key="product.id"
        v-bind="productCardProps(product)"
      />
    </div>
  </section>
</template>
