<script setup lang="ts">
import { SfScrollable, SfButton } from '@storefront-ui/vue'
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
  <div class="narrow-container py-[40px] md:py-[80px]">
    <div class="flex flex-col sm:flex-row flex-wrap justify-between items-start sm:items-center gap-4 mb-[30px] md:mb-[50px]">
      <h2
        v-if="heading"
        class="text-[24px] sm:text-[28px] font-normal"
      >
        {{ heading }}
      </h2>
      <SfButton type="button" class="!bg-white !text-black !border !border-black !ring-none !shadow-none min-h-[48px] text-[16px] font-normal tracking-[0.5px] px-7 gap-3 hidden sm:flex">
        SHOP All BEST SELLERS
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="black">
          <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z"/>
        </svg>
      </SfButton>
    </div>
    <p v-if="text" class="my-4 typography-text-lg">
      {{ text }}
    </p>
    <SfScrollable
      v-if="props.productTemplateList?.length > 0"
      buttons-placement="block"
      class="items-center pb-8 sm:pb-12 sm:mb-20"
      data-testid="product-slider"
      drag="true"
    >
      <LazyUiProductCard
        v-for="(productTemplate, index) in props.productTemplateList"
        :key="productTemplate?.id || index"
        class="min-w-[300px] max-w-[300px] sm:min-w-[322px] sm:max-w-[322px]"
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
        :rating-count="0"
        :rating="0"
        :first-variant="productTemplate.firstVariant as Product"
      />
    </SfScrollable>
    <SfButton type="button" class="!bg-white !text-black !border !border-black !ring-none !shadow-none min-h-[48px] text-[16px] font-normal tracking-[0.5px] px-7 gap-3 flex sm:hidden mt-10">
      SHOP All BEST SELLERS
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="black">
        <path d="M17.8348 9.95264C18.0527 9.73467 18.0527 9.37607 17.8348 9.15811L12.7723 4.09561C12.5543 3.87764 12.1957 3.87764 11.9777 4.09561C11.7598 4.31357 11.7598 4.67217 11.9777 4.89014L16.0805 8.99287H0.5625C0.253125 8.99287 0 9.246 0 9.55537C0 9.86475 0.253125 10.1179 0.5625 10.1179H16.0805L11.9777 14.2206C11.7598 14.4386 11.7598 14.7972 11.9777 15.0151C12.1957 15.2331 12.5543 15.2331 12.7723 15.0151L17.8348 9.95264Z"/>
      </svg>
    </SfButton>

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