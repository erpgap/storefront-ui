<script lang="ts" setup>
import {
  SfRating,
  SfCounter,
  SfButton,
  SfIconShoppingCart,
  SfIconFavorite,
  SfIconFavoriteFilled,
} from '@storefront-ui/vue'
import type { CustomProductWithStockFromRedis, Product } from '~/graphql'

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
  description: {
    type: String,
    required: false,
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

const { cartAdd } = useCart()
const { wishlistAddItem, isInWishlist, wishlistRemoveItem } = useWishlist()

const handleWishlistAddItem = async (firstVariant: CustomProductWithStockFromRedis) => {
  await wishlistAddItem(firstVariant.id)
}

const handleWishlistRemoveItem = async (firstVariant: CustomProductWithStockFromRedis) => {
  await wishlistRemoveItem(firstVariant.id)
}
</script>

<template>
  <div
    class="relative border border-neutral-200 rounded-md hover:shadow-lg min-h-[330px] flex flex-col justify-around"
  >
    <div class="relative">
      <NuxtLink :to="slug">
        <NuxtImg
          :src="imageUrl"
          :alt="imageAlt"
          :width="370"
          :height="370"
          class="rounded-md"
          :loading="loading"
        />
      </NuxtLink>

      <SfButton
        type="button"
        variant="tertiary"
        size="sm"
        square
        :class="[
          'absolute bottom-0 right-0 mr-2 mb-2 bg-white border border-neutral-200 !rounded-full',
          { '!bg-green-200': isInWishlist(firstVariant?.id) },
        ]"
        aria-label="Add to wishlist"
        @click="
          isInWishlist(firstVariant?.id)
            ? handleWishlistRemoveItem(firstVariant as CustomProductWithStockFromRedis)
            : handleWishlistAddItem(firstVariant as CustomProductWithStockFromRedis)
        "
      >
        <SfIconFavoriteFilled
          v-if="isInWishlist(firstVariant?.id)"
          size="sm"
        />
        <SfIconFavorite
          v-else
          size="sm"
        />
      </SfButton>
    </div>
    <div
      class="p-2 border-t border-neutral-200 typography-text-sm flex flex-col justify-between gap-1 h-full"
    >
      <NuxtLink
        :to="slug"
        variant="secondary"
        class="no-underline self-start text-left"
      >
        {{ name }}
      </NuxtLink>
      <div class="flex items-center mb-2">
        <SfRating
          size="xs"
          :value="4"
          :max="5"
        />
        <SfCounter
          class="ml-1"
          size="xs"
        >
          26
        </SfCounter>
      </div>
      <p
        v-if="description"
        class="block font-normal leading-5 typography-text-sm text-neutral-700"
      >
        {{ description }}
      </p>
      <div class="flex justify-between">
        <div class="block">
          <span class="font-bold typography-text-sm">{{
            $currency(specialPrice)
          }}</span>
          <span
            v-if="regularPrice"
            class="ml-1.5 font-normal typography-text-xs line-through"
          >{{ $currency(regularPrice) }}</span>
        </div>
        <SfButton
          type="button"
          class="ottom-2"
          size="sm"
          :disabled="!firstVariant?.stock || firstVariant?.stock <= 0"
          @click="cartAdd(firstVariant?.id, 1)"
        >
          <template #prefix>
            <SfIconShoppingCart size="sm" />
          </template>
          Add
        </SfButton>
      </div>
    </div>
  </div>
</template>
