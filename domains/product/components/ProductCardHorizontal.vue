<script setup lang="ts">
import type { PropType } from "vue";
import type { Product } from "~/graphql";

defineProps({
  product: {
    type: Object as PropType<Product>,
    required: true,
    default: () => {},
  },
});
</script>
<template>
  <div
    class="flex min-w-[320px] max-w-[470px] pt-4"
    data-testid="product-card-horizontal"
  >
    <div class="relative overflow-hidden rounded-md w-[100px]">
      <NuxtImg
        class="w-full h-auto border rounded-md border-neutral-200"
        :src="
          $getImage(
            String(product?.image),
            370,
            370,
            String(product?.imageFilename)
          )
        "
        :alt="product?.imageFilename ?? ''"
        width="300"
        height="300"
        loading="lazy"
        format="webp"
      />
    </div>
    <div class="flex flex-col pl-4 min-w-[180px] flex-1 typography-text-base">
      {{ product?.name }}
      <div class="my-2 sm:mb-0">
        <ul
          class="font-normal leading-5 typography-text-xs sm:typography-text-sm text-neutral-700"
        >
          <li v-for="attribute in product?.variantAttributeValues">
            <span class="mr-1">{{ attribute?.attribute?.name }}:</span>
            <span class="font-medium">{{ attribute?.name }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
