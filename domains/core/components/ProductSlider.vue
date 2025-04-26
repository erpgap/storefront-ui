<script setup lang="ts">
import { SfScrollable } from '@storefront-ui/vue'
import type { Product } from '~/graphql'

const props = defineProps({
  heading: String,
  text: String,
  productTemplateList: {
    type: Array<Product>,
    default: () => [],
  },
})

const { getRegularPrice, getSpecialPrice } = useProductAttributes()
</script>

<template>
  <h2
    v-if="heading"
    class="text-center mb-6 font-bold typography-headline-3 md:typography-headline-2"
  >
    {{ heading }}
  </h2>
  <p class="my-4 typography-text-lg">
    {{ text }}
  </p>
  <SfScrollable
    v-if="props.productTemplateList?.length > 0"
    buttons-placement="floating"
    class="items-center pb-4"
    data-testid="product-slider"
    style="scrollbar-width: none;"
  >
    <LazyUiProductCard
      v-for="(productTemplate, index) in props.productTemplateList"
      :key="productTemplate?.id || index"
      class="min-w-[190px] max-w-[190px]"
      :slug=" mountUrlSlugForProductVariant(productTemplate.firstVariant as Product) || '' "
      :name="productTemplate?.name || ''"
      :image-url="
        $getImage(
          String(productTemplate.image),
          370,
          370,
          String(productTemplate.imageFilename),
        )
      "
      :image-alt="productTemplate?.name || ''"
      :regular-price="getRegularPrice(productTemplate.firstVariant as Product)"
      :special-price="getSpecialPrice(productTemplate.firstVariant as Product)"
      :is-in-wishlist="productTemplate?.isInWishlist || false"
      :rating-count="productTemplate.ratingCount"
      :rating="productTemplate.rating"
      :first-variant="productTemplate.firstVariant as Product"
    />
  </SfScrollable>
</template>
