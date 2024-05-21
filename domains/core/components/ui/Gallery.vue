<script lang="ts" setup>
import { SfScrollable } from '@storefront-ui/vue';
import { ref } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    default: [],
  },
});

const thumbsRef = ref<HTMLElement>();
const activeIndex = ref(0);
const images = computed<any[]>(() => props.images);
</script>

<template>
  <div class="relative flex w-full max-h-[600px] aspect-[4/3]">
    <SfScrollable
      ref="thumbsRef"
      class="items-center w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      direction="vertical"
      :active-index="activeIndex"
      buttons-placement="none"
    >
      <button
        v-for="({ imageThumbSrc, alt }, index) in images"
        :key="`${alt}-${index}-thumbnail`"
        type="button"
        :aria-label="alt"
        :aria-current="activeIndex === 0"
        class="md:w-[78px] md:h-auto relative shrink-0 pb-1 mx-4 border-b-4 snap-start cursor-pointer focus-visible:outline focus-visible:outline-offset transition-colors flex-grow md:flex-grow-0 border-primary-700"
      >
        <NuxtImg provider="odooProvider" :alt="alt" class="object-cover" width="78" height="78" :src="imageThumbSrc" />
      </button>
    </SfScrollable>
    <SfScrollable
      class="w-full h-full snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      :active-index="activeIndex"
      direction="vertical"
      wrapper-class="h-full m-auto"
      is-active-index-centered
      buttons-placement="none"
      :drag="{ containerWidth: true }"
    >
      <div
        v-for="({ imageSrc, alt }, index) in images"
        :key="`${alt}-${index}`"
        class="flex justify-center h-full basis-full shrink-0 grow snap-center"
      >
        <NuxtImg
          provider="odooProvider"
          :width="380"
          :height="505"
          :aria-label="alt"
          :aria-hidden="activeIndex !== index"
          class="object-cover w-auto h-full"
          :alt="alt"
          :src="imageSrc"
        />
      </div>
    </SfScrollable>
  </div>
</template>
