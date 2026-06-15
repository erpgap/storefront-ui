<script setup lang="ts">
import { SfScrollable } from '@storefront-ui/vue'
import type { Product } from '~~/graphql'

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
  <div class="narrow-container py-[40px] md:py-[80px]">
    <div class="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4 mb-[30px] md:mb-[50px]">
      <h2
        v-if="heading"
        class="text-[24px] sm:text-[28px] font-normal"
      >
        {{ heading }}
      </h2>
    </div>
    <p
      v-if="text"
      class="my-4 typography-text-lg"
    >
      {{ text }}
    </p>
    <SfScrollable
      v-if="props.productTemplateList?.length > 0"
      buttons-placement="block"
      class="items-center pb-8 sm:pb-12 sm:mb-20"
      data-testid="product-slider"
      :drag="true"
    >
      <LazyUiProductCard
        v-for="(productTemplate, index) in props.productTemplateList"
        :key="productTemplate?.id || index"
        class="min-w-[300px] max-w-[300px] sm:min-w-[322px] sm:max-w-[322px]"
        :slug=" mountUrlSlugForProductVariant(productTemplate.firstVariant as Product) || '' "
        :name="productTemplate?.name || ''"
        :image-url="productTemplate.imageUrl ?? ''"
        :image-alt="productTemplate?.name || ''"
        :regular-price="getRegularPrice(productTemplate.firstVariant as Product)"
        :special-price="getSpecialPrice(productTemplate.firstVariant as Product)"
        :is-in-wishlist="productTemplate?.isInWishlist || false"
        :rating-count="(productTemplate as any)?.ratingCount ?? 0"
        :rating="(productTemplate as any)?.ratingAvg ?? 0"
        :first-variant="productTemplate.firstVariant as Product"
      />
    </SfScrollable>
  </div>
</template>

<style scoped>
:deep(button[aria-label="Previous"]) {
  position: absolute;
  bottom: 0;
  right: 4rem;
}
:deep(button[aria-label="Next"]) {
  position: absolute;
  bottom: 0;
  right: 0;
}
:deep(button[aria-label="Previous"]),
:deep(button[aria-label="Next"]) {
  width: 50px;
  height: 50px;
  border: 1px solid #E5E7EB!important;
  box-shadow: none!important;
  padding: 0!important;
  background-color: white!important;
}
:deep(button[aria-label="Previous"]) svg,
:deep(button[aria-label="Next"]) svg {
  width: 35px;
  height: 35px;
}
</style>
