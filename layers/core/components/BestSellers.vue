<script setup lang="ts">
import type { Product } from '~~/graphql'

const NuxtLink = resolveComponent('NuxtLink')

const { loadProductTemplateList, productTemplateList } = useProductTemplateList('best-sellers')
const { getRegularPrice, getSpecialPrice } = useProductAttributes()

// Most popular products first (sort field exposed by ProductSortInput)
await loadProductTemplateList({ pageSize: 4, sort: { popular: 'DESC' } as any })
</script>

<template>
  <section v-if="productTemplateList.length" class="narrow-container pb-[clamp(64px,9vw,132px)]">
    <div class="flex items-end justify-between gap-6 mb-12">
      <div>
        <p class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400 mb-3.5">
          Curated
        </p>
        <h2 class="font-light tracking-[-0.02em] text-[clamp(28px,3.4vw,44px)]">
          Best Sellers
        </h2>
      </div>
      <NuxtLink
        to="/products"
        class="group hidden sm:inline-flex items-center gap-2 pb-2 text-[13px] tracking-[0.1em] uppercase text-primary-600 whitespace-nowrap border-b border-transparent transition-colors hover:text-black hover:border-black"
      >
        View all
        <svg width="16" height="12" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M1 7h15M11 1l5 6-5 6" stroke-linecap="round" stroke-linejoin="round" />
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
