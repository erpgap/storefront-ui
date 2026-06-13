<script setup lang="ts">
import type { CustomProductWithStockFromRedis, Product } from '~~/graphql'

const NuxtLink = resolveComponent('NuxtLink')

const { loadProductTemplateList, productTemplateList } = useProductTemplateList('best-sellers')
const { getRegularPrice, getSpecialPrice } = useProductAttributes()
const { cartAdd } = useCart()
const { wishlistAddItem, wishlistRemoveItem, isInWishlist } = useWishlist()

// Most popular products first (sort field exposed by ProductSortInput)
await loadProductTemplateList({ pageSize: 4, sort: { popular: 'DESC' } as any })

const toggleWishlist = (variant: CustomProductWithStockFromRedis) => {
  if (!variant?.id) return
  isInWishlist(variant.id) ? wishlistRemoveItem(variant.id) : wishlistAddItem(variant.id)
}
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
      <article
        v-for="product in productTemplateList"
        :key="product.id"
        class="group relative flex flex-col"
      >
        <div class="relative overflow-hidden rounded-[3px] bg-primary-50">
          <NuxtLink :to="mountUrlSlugForProductVariant(product.firstVariant as Product) || ''" prefetch>
            <NuxtImg
              provider="odooProvider"
              :src="product.imageUrl ?? ''"
              :alt="product.name ?? ''"
              :width="370"
              :height="494"
              class="w-full aspect-[3/4] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </NuxtLink>

          <button
            type="button"
            aria-label="Add to wishlist"
            class="absolute top-3.5 right-3.5 z-[2] grid place-items-center w-[38px] h-[38px] rounded-full bg-white/90 text-primary-600 transition-all duration-300 hover:text-black lg:opacity-0 lg:-translate-y-1.5 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
            @click="toggleWishlist(product.firstVariant as CustomProductWithStockFromRedis)"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              :fill="isInWishlist(product.firstVariant?.id) ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
            </svg>
          </button>

          <button
            type="button"
            class="absolute left-3.5 right-3.5 bottom-3.5 z-[2] h-[46px] !rounded-[2px] bg-primary-900 text-white text-[12px] tracking-[0.14em] uppercase font-medium transition-all duration-300 hover:bg-primary-700 lg:opacity-0 lg:translate-y-3 lg:group-hover:opacity-100 lg:group-hover:translate-y-0"
            @click="cartAdd(product.firstVariant?.id, 1)"
          >
            Add to Bag
          </button>
        </div>

        <div class="pt-4">
          <NuxtLink
            :to="mountUrlSlugForProductVariant(product.firstVariant as Product) || ''"
            class="block text-[15px] font-medium leading-tight"
          >
            {{ product.name }}
          </NuxtLink>
          <p class="mt-1.5 text-[14px] text-primary-600">
            <del
              v-if="getRegularPrice(product.firstVariant)"
              class="text-primary-300 mr-2"
            >{{ $currency(getRegularPrice(product.firstVariant)) }}</del>
            {{ $currency(getSpecialPrice(product.firstVariant)) }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
