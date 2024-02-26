<script setup>
import { SfButton } from '@storefront-ui/vue';

const NuxtLink = resolveComponent('NuxtLink');

const items = ref([
  {
    title: 'NEW COLLECTION',
    reverse: true,
    subtitle: 'Fresh and Bold',
    description: 'Add a pop up color to your outfit',
    buttonText: 'Discover now',
    image: '/images/display-1.png',
  },
  {
    title: 'BE INSPIRED',
    reverse: true,
    subtitle: 'Sunny Days Ahead',
    description: 'Step out in style with our sunglasses collection',
    buttonText: 'Discover now',
    image: '/images/display-2.png',
  },
  {
    title: 'BE ACTIVE',
    reverse: true,
    subtitle: 'Gear up and get ready',
    description: 'AExplore the great outdoors with our backpacks',
    buttonText: 'Discover now',
    image: '/images/display-3.png',
  },
]);
</script>

<template>
  <div class="flex flex-col md:flex-row flex-wrap gap-6 mb-10" data-testid="display">
    <div
      v-for="item in items"
      :key="item.title"
      class="relative flex md:max-w-screen-3xl md:[&:not(:first-of-type)]:flex-1 md:first-of-type:w-full first:bg-secondary-200 last:bg-warning-200 even:bg-negative-200"
    >
      <div
        :class="[
          'flex overflow-hidden grow flex-col',
          {
            'flex-col-reverse': item.reverse,
            'md:flex-row-reverse': item.reverse,
          },
        ]"
      >
        <div class="flex flex-1 flex-col justify-center items-center md:items-start p-6 lg:p-10 max-w-1/2">
          <p class="uppercase typography-text-xs block font-bold tracking-widest">
            {{ item.subtitle }}
          </p>
          <h2 class="mb-4 mt-2 font-bold typography-headline-3">
            {{ item.title }}
          </h2>
          <p class="typography-text-base block text-center md:text-left mb-4">
            {{ item.description }}
          </p>
          <SfButton class="!bg-black text-white" :tag="NuxtLink" to="/">
            {{ item.buttonText }}
          </SfButton>
        </div>
        <NuxtImg
          :src="item.image"
          :alt="item.title"
          class="w-full md:w-1/2 self-end object-contain flex-1"
          width="300"
          height="300"
          loading="lazy"
          format="webp"
        />
      </div>
    </div>
  </div>
</template>
