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
    <!-- Section title — same style as the PDP "Product Details" heading -->
    <div class="mb-[30px] md:mb-[44px]">
      <h2
        v-if="heading || text"
        class="font-light tracking-[-0.01em] text-[clamp(22px,2.4vw,30px)]"
      >
        {{ heading || text }}
      </h2>
      <p
        v-if="heading && text"
        class="mt-2 text-primary-500 font-light"
      >
        {{ text }}
      </p>
    </div>
    <SfScrollable
      v-if="props.productTemplateList?.length > 0"
      buttons-placement="block"
      class="items-center pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
/* Small, subtle circular nav buttons (bottom-right). Hidden on mobile, where
   the slider is swiped. */
:deep(button[aria-label="Previous"]),
:deep(button[aria-label="Next"]) {
  position: absolute;
  bottom: 0;
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb !important;
  border-radius: 9999px !important;
  box-shadow: none !important;
  padding: 0 !important;
  background-color: #fff !important;
  color: #171717;
  transition: border-color 0.2s ease, color 0.2s ease;
}
:deep(button[aria-label="Previous"]:hover),
:deep(button[aria-label="Next"]:hover) {
  border-color: #171717 !important;
}
:deep(button[aria-label="Previous"]) {
  right: 3.25rem;
}
:deep(button[aria-label="Next"]) {
  right: 0;
}
:deep(button[aria-label="Previous"]) svg,
:deep(button[aria-label="Next"]) svg {
  width: 18px;
  height: 18px;
}
@media (max-width: 640px) {
  :deep(button[aria-label="Previous"]),
  :deep(button[aria-label="Next"]) {
    display: none;
  }
}
</style>
