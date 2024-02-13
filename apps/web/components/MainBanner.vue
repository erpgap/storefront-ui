<template>
  <div class="relative min-h-[600px] mb-10">
    <div
      class="md:flex md:flex-row-reverse md:justify-center min-h-[600px] max-w-screen-3xl mx-auto"
    >
      <div
        class="flex flex-col justify-center md:basis-2/4 md:items-stretch md:overflow-hidden"
      >
        <NuxtImg
          provider="odooProvider"
          src="/web/image/product.template/94/image_1920/"
          alt="Hero"
          class="h-auto w-full object-cover object-left"
          width="575"
          height="451"
          sizes="100vw sm:50vw md:764px"
          fetchpriority="high"
          format="webp"
          preload
        />
      </div>
      <div
        class="md:flex md:flex-col md:justify-center md:items-start md:basis-2/4"
      >
        <p
          class="typography-text-xs md:typography-text-sm font-bold tracking-widest text-neutral-500 uppercase"
        >
          SPECIAL OFFER
        </p>
        <h1
          class="typography-headline-2 md:typography-headline-1 md:leading-[67.5px] font-bold mt-2 mb-4"
        >
          Jackets hot drops
        </h1>
        <p class="typography-text-base md:typography-text-lg">
          This fashionable jackets collection features various colors, comfort
          and style.
        </p>
        <div class="flex flex-col md:flex-row gap-4 mt-6">
          <SfButton size="lg" :tag="NuxtLink" to="/product/leather-jacket-d-r-o-w-s-black-94?Size=189&Material=188&Color=191"> Order Now </SfButton>
          <SfButton
            size="lg"
            :tag="NuxtLink"
            to="/category/53"
            class="bg-white"
            variant="secondary"
          >
            Show More
          </SfButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue';

const NuxtLink = resolveComponent('NuxtLink');
</script>
