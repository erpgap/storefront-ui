<script lang="ts" setup>
import type { ImageGalleryItem } from '~~/graphql'

const props = defineProps({
  mainImage: {
    type: Object as PropType<ImageGalleryItem>,
    required: false,
  },
  thumbs: {
    type: Array as PropType<ImageGalleryItem[]>,
    default: () => [],
  },
})

const activeIndex = ref(0)
const allImages = computed(() =>
  [
    ...(props.mainImage?.url
      ? [
          {
            imageSrc: props.mainImage.url,
            imageThumbSrc: props.mainImage.url,
            alt: props.mainImage.alt,
          },
        ]
      : []),
    ...props.thumbs.map((thumb: { url: any, alt: any }) => ({
      imageSrc: thumb.url,
      imageThumbSrc: thumb.url,
      alt: thumb.alt,
    })),
  ].filter(image => image.imageSrc),
)

// Reset to the first image when the set changes (e.g. switching colour variant).
watch(() => props.mainImage?.url, () => {
  activeIndex.value = 0
})

const activeImage = computed(() => allImages.value[activeIndex.value] ?? allImages.value[0])
</script>

<template>
  <div class="flex gap-3 md:gap-4">
    <!-- Thumbnails -->
    <div
      v-if="allImages.length > 1"
      class="flex flex-col gap-2.5 md:gap-3 shrink-0"
    >
      <button
        v-for="({ imageThumbSrc, alt }, index) in allImages"
        :key="`${alt}-${index}-thumbnail`"
        type="button"
        :aria-label="alt"
        :aria-current="activeIndex === index"
        class="w-[60px] md:w-[72px] aspect-[4/5] overflow-hidden rounded-[2px] border transition-all duration-200 cursor-pointer focus-visible:outline focus-visible:outline-offset"
        :class="activeIndex === index
          ? 'border-black opacity-100'
          : 'border-primary-200 opacity-60 hover:opacity-100 hover:border-primary-300'"
        @click="activeIndex = index"
      >
        <NuxtImg
          provider="odooProvider"
          :alt="alt"
          class="w-full h-full object-cover"
          width="100"
          height="125"
          :src="imageThumbSrc"
        />
      </button>
    </div>

    <!-- Main image. NB: keep `flex-1` and `aspect-ratio` on SEPARATE elements —
         combining them on one flex item makes Safari/Firefox collapse it. The
         flex item just claims the width; the inner block owns the aspect ratio. -->
    <div class="flex-1 min-w-0">
      <!-- 4:5 via percentage-padding (pt-[125%]), not `aspect-ratio` — iOS WebKit
           mis-sizes aspect-ratio on flex items, collapsing the image. -->
      <div class="relative pt-[125%] bg-primary-50 rounded-[2px] overflow-hidden">
        <NuxtImg
          v-if="activeImage"
          provider="odooProvider"
          :width="560"
          :height="700"
          class="absolute inset-0 w-full h-full object-cover"
          :alt="activeImage.alt"
          :src="activeImage.imageSrc"
          loading="eager"
          fetchpriority="high"
        />
      </div>
    </div>
  </div>
</template>
