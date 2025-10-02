<script setup lang="ts">
import { SfScrollable } from '@storefront-ui/vue'
import type { Product } from '~/graphql'

defineProps({
  heading: String,
  text: String,
})

const { loadProductTemplateList, loading, productTemplateList } = useProductTemplateList('')
const { getRegularPrice, getSpecialPrice } = useProductAttributes()

const numOfProducts = 10
await loadProductTemplateList({ pageSize: numOfProducts })
</script>

<template>
  <div class="narrow-container pt-[40px] pb-[40px] md:pt-[80px] md:pb-[120px]">
    <h2 class="text-[24px] sm:text-[28px] font-normal mb-[30px] md:mb-[50px]" v-if="heading">
      {{ heading }}
    </h2>
    <p class="my-4 typography-text-lg">
      {{ text }}
    </p>
    <SfScrollable
      v-if="productTemplateList.length > 0"
      buttons-placement="block"
      class="items-center pb-10"
      data-testid="product-slider"
      drag="true"
    >
      <LazyUiProductCard
        v-for="productTemplate in productTemplateList"
        :key="productTemplate.id"
        class="min-w-[300px] max-w-[300px] md:min-w-[320px] md:max-w-[320px]"
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
  </div>
</template>

<style scoped>
:deep(button[aria-label="Next"]),
:deep(button[aria-label="Previous"]) {
  padding: 0!important;
  width: 50px!important;
  height: 50px!important;
  background-color: white!important;
  position: absolute!important;
  top: 0!important;
  right: 0!important;
  transform: translateY(-190%);
}

:deep(button[aria-label="Previous"]) {
  right: 3.25rem!important;
}

:deep(button[aria-label="Next"] svg),
:deep(button[aria-label="Previous"] svg) {
  width: 35px!important;
  height: auto!important;
}
</style>