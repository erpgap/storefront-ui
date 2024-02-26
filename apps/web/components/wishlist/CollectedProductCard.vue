<script setup lang="ts">
import { SfLink, SfButton, SfIconClose } from '@storefront-ui/vue';
import { PropType } from 'nuxt/dist/app/compat/capi';
import { Product } from '~/graphql';

const NuxtLink = resolveComponent('NuxtLink');

const props = defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
  },
});
</script>

<template>
  <div
    class="relative flex first:border-t border-b-[1px] border-neutral-200 hover:shadow-lg min-w-[320px] p-4 last:mb-0"
    data-testid="cart-product-card"
  >
    <div class="min-w-[114px] w-[114px] overflow-hidden rounded-md">
      <SfLink :to="mountUrlSlugForProductVariant(product)" :tag="NuxtLink">
        <NuxtImg
          provider="odooProvider"
          class="border rounded-md border-neutral-200"
          :src="product?.image ?? '/images/product.webp'"
          :alt="product?.imageFilename ?? ''"
          width="114"
          height="151"
          loading="lazy"
        />
      </SfLink>
    </div>
    <div class="flex flex-col pl-4 pr-5">
      <div class="flex flex-col min-w-[180px] flex-1">
        <SfLink
          :tag="NuxtLink"
          :to="mountUrlSlugForProductVariant(product)"
          variant="secondary"
          class="no-underline typography-text-sm sm:typography-text-lg"
        >
          {{ product?.name }}
        </SfLink>
        <div class="flex">
          <span
            v-if="product?.combinationInfoVariant?.price"
            class="text-secondary-700 sm:order-1 font-bold typography-text-sm sm:typography-text-lg"
          >
            ${{ product?.combinationInfoVariant?.price }}
            <span class="text-neutral-500 ml-2 line-through typography-text-xs sm:typography-text-sm font-normal">
              ${{ product?.combinationInfoVariant?.list_price }}
            </span>
          </span>
          <span v-else class="font-bold sm:ml-auto sm:order-1 typography-text-sm sm:typography-text-lg">
            ${{ product?.combinationInfoVariant?.list_price }}
          </span>
        </div>
      </div>
    </div>
    <div>
      <SfButton
        class="!p-1 !rounded-full absolute top-2 right-1"
        type="button"
        variant="tertiary"
        size="sm"
        @click="$emit('removeFromWishlist', product.id)"
      >
        <SfIconClose />
      </SfButton>
    </div>
  </div>
</template>
