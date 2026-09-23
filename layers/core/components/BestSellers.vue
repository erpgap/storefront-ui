<script setup lang="ts">
import type { Product, QueryProductsArgs } from '~~/graphql'

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
const { getRegularPrice, getSpecialPrice } = useProductAttributes()

// Clamped server-side too (the `pageSize` field declares min/max), but a
// component that trusts its props to be sane is a component that breaks the
// first time someone calls it from outside the CMS.
const count = computed(() => Math.min(Math.max(Number(props.pageSize) || 4, 1), 12))

await loadProductTemplateList({
  pageSize: count.value,
  sort: SORTS[props.sort] ?? SORTS.popular,
} as any)
</script>

<template>
  <section
    v-if="productTemplateList.length"
    class="narrow-container pb-[clamp(64px,9vw,132px)]"
  >
    <div class="flex items-end justify-between gap-6 mb-12">
      <div>
        <p
          v-if="eyebrow"
          class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400 mb-3.5"
        >
          {{ eyebrow }}
        </p>
        <h2 class="font-light tracking-[-0.02em] text-[clamp(28px,3.4vw,44px)]">
          {{ title }}
        </h2>
      </div>
      <NuxtLink
        v-if="linkLabel"
        :to="linkUrl || '/products'"
        class="group hidden sm:inline-flex items-center gap-2 pb-2 text-[13px] tracking-[0.1em] uppercase text-primary-600 whitespace-nowrap border-b border-transparent transition-colors hover:text-black hover:border-black"
      >
        {{ linkLabel }}
        <svg
          width="16"
          height="12"
          viewBox="0 0 18 14"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <path
            d="M1 7h15M11 1l5 6-5 6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-7 gap-y-10">
      <UiProductCard
        v-for="product in productTemplateList"
        :key="product.id"
        :slug="mountUrlSlugForProductVariant(product.firstVariant as Product) || ''"
        :name="product.name || ''"
        :image-url="product.imageUrl ?? ''"
        :image-alt="product.name || ''"
        :regular-price="getRegularPrice(product.firstVariant as Product)"
        :special-price="getSpecialPrice(product.firstVariant as Product)"
        :rating-count="(product as any)?.ratingCount ?? 0"
        :rating="(product as any)?.ratingAvg ?? 0"
        :first-variant="product.firstVariant as Product"
      />
    </div>
  </section>
</template>
