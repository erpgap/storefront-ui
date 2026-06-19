<script lang="ts" setup>
import { SfRating } from '@storefront-ui/vue'
import type { CustomProductWithStockFromRedis } from '~~/graphql'

defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
  imageAlt: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  ratingCount: {
    type: Number,
    required: false,
  },
  rating: {
    type: Number,
    required: false,
  },
  regularPrice: {
    type: Number,
    required: true,
  },
  specialPrice: {
    type: Number,
    required: false,
    default: null,
  },
  firstVariant: {
    type: Object as PropType<CustomProductWithStockFromRedis>,
    required: false,
  },
  loading: {
    type: String as PropType<'eager' | 'lazy' | undefined>,
    required: false,
    default: 'lazy',
  },
})

const { wishlistAddItem, isInWishlist, wishlistRemoveItem } = useWishlist()

const toggleWishlist = (variant?: CustomProductWithStockFromRedis) => {
  if (!variant?.id) return
  isInWishlist(variant.id) ? wishlistRemoveItem(variant.id) : wishlistAddItem(variant.id)
}
</script>

<template>
  <div class="group relative flex flex-col">
    <div class="relative overflow-hidden rounded-[3px] bg-gradient-to-br from-[#efefef] to-[#e2e2e2]">
      <NuxtLink :to="slug" prefetch>
        <NuxtImg
          provider="odooProvider"
          :src="imageUrl"
          :alt="imageAlt"
          :width="370"
          :height="370"
          class="w-full aspect-square object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          :loading="loading"
        />
      </NuxtLink>

      <button
        type="button"
        aria-label="Add to wishlist"
        class="absolute top-3 right-3 z-[2] grid place-items-center w-[44px] h-[44px] rounded-full bg-white/90 text-primary-700 transition-colors duration-200 hover:text-black"
        @click="toggleWishlist(firstVariant)"
      >
        <UiLineIcon name="heart" :filled="isInWishlist(firstVariant?.id)" :size="24" />
      </button>
    </div>

    <div class="pt-3">
      <NuxtLink
        :to="slug"
        class="block text-[15px] font-medium leading-tight"
      >
        {{ name }}
      </NuxtLink>

      <!-- Price: new (special) on the left, old (regular) struck through on the right -->
      <p class="mt-1.5 flex items-baseline gap-2">
        <span class="text-[16px] font-medium text-black">{{ $currency(specialPrice) }}</span>
        <span
          v-if="regularPrice"
          class="text-[14px] text-primary-300 line-through"
        >{{ $currency(regularPrice) }}</span>
      </p>

      <!-- Reviews live at the bottom of the card -->
      <div
        v-if="(ratingCount ?? 0) > 0"
        class="mt-2 inline-flex items-center gap-1.5 text-[13px] text-primary-500"
      >
        <SfRating size="xs" :value="Math.round(rating ?? 0)" :max="5" />
        <span>({{ (rating ?? 0).toFixed(1) }})</span>
        <span class="text-primary-200">·</span>
        <span>{{ ratingCount }} reviews</span>
      </div>
    </div>
  </div>
</template>
