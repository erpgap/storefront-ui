<script setup lang="ts">
import { SfScrollable } from '@storefront-ui/vue';
import { Product } from '~/graphql';

defineProps({
  heading: String,
  text: String,
});

const { loadProductTemplateList, loading, productTemplateList } = useProductTemplateList('');
const { getRegularPrice, getSpecialPrice } = useProductAttributes();

const numOfProducts = 10;
await loadProductTemplateList({ pageSize: numOfProducts });
</script>

<template>
  <h2 v-if="heading" class="text-center mb-6 font-bold typography-headline-3 md:typography-headline-2">
    {{ heading }}
  </h2>
  <p class="my-4 typography-text-lg">
    {{ text }}
  </p>
  <SfScrollable
    v-if="productTemplateList.length > 0"
    buttons-placement="floating"
    class="items-center pb-4"
    data-testid="product-slider"
  >
    <LazyUiProductCard
      v-for="productTemplate in productTemplateList"
      :key="productTemplate.id"
      class="min-w-[190px]"
      :slug="mountUrlSlugForProductVariant(productTemplate.firstVariant as Product) || ''"
      :name="productTemplate?.name || ''"
      :image-url="$getImage(String(productTemplate.image), 370, 370, String(productTemplate.imageFilename))"
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
