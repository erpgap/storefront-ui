<script lang="ts" setup>
import { SfRating, SfCounter, SfLink, SfButton, SfIconShoppingCart, SfIconFavorite, SfIconFavoriteFilled } from '@storefront-ui/vue';
import { useToast } from 'vue-toastification';
import { Product } from '~/graphql';

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
  },
  firstVariant: {
    type: Object,
    required: false,
  },
  loading: {
    type: String as PropType<'eager' | 'lazy' | undefined>,
    required: false,
    default: 'lazy',
  },
});

const { cartAdd } = useCart();
const { wishlistAddItem, isInWishlist, wishlistRemoveItem } = useWishlist();

const handleWishlistAddItem = async (firstVariant: Product) => {
  await wishlistAddItem(firstVariant.id);
};

const handleWishlistRemoveItem = async (firstVariant: Product) => {
  await wishlistRemoveItem(firstVariant.id);
};
</script>
<template>
  <div class="relative border border-neutral-200 rounded-md hover:shadow-lg min-h-[350px]">
    <div class="relative">
      <SfLink :href="slug">
        <NuxtImg
          :src="imageUrl"
          :alt="imageAlt"
          :width="370"
          :height="370"
          class="rounded-md"
          :loading="loading"
        />
      </SfLink>

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
        @click="isInWishlist(firstVariant?.id) ? handleWishlistRemoveItem(firstVariant as Product) : handleWishlistAddItem(firstVariant as Product)"
      >
        <SfIconFavoriteFilled size="sm" v-if="isInWishlist(firstVariant?.id)" />
        <SfIconFavorite size="sm" v-else />
      </SfButton>
    </div>
    <div class="p-2 border-t border-neutral-200 typography-text-sm">
      <SfLink :href="slug" variant="secondary" class="no-underline">
        {{ name }}
      </SfLink>
      <div class="flex items-center pt-1">
        <SfRating size="xs" :value="rating ?? 0" :max="5" />
        <SfLink
          to="#"
          variant="secondary"
          class="ml-1 no-underline"
        >
          <SfCounter size="xs">{{ ratingCount }}</SfCounter>
        </SfLink>
      </div>
      <p
        v-if="description"
        class="block py-2 font-normal leading-5 typography-text-sm text-neutral-700"
      >
        {{ description }}
      </p>
      <div class="block pb-10 pt-3">
        <span class="font-bold typography-text-sm">${{ regularPrice }}</span>
        <span
          v-if="specialPrice"
          class="ml-1.5 font-normal typography-text-xs line-through"
          >${{ specialPrice }}</span
        >
      </div>
      <SfButton
        type="button"
        class="absolute bottom-2"
        size="sm"
        @click="cartAdd(firstVariant?.id, 1)"
      >
        <template #prefix>
          <SfIconShoppingCart size="sm" />
        </template>
        Add
      </SfButton>
    </div>
  </div>
</template>
