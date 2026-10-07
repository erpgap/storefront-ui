<script setup lang="ts">
// An image from block data, which is routinely empty.
//
// A merchant adds a block and fills it in from the top, so every image field
// spends time blank - and a NuxtImg given an empty src renders an <img> with
// no source, which the browser draws as a broken-image icon. That reads as
// "something is wrong" at the exact moment nothing is wrong yet, and it says
// it in the canvas while the inspector is already saying "Image is required"
// three inches away.
//
// So: the image when there is one, and a quiet placeholder holding the same
// space when there is not. The placeholder keeps the card's geometry, so the
// layout does not jump once a picture is chosen.
import { imageProvider } from '~~/app/utils/odooImage'

withDefaults(defineProps<{
  src?: string
  width: number
  height: number
  sizes?: string
  /** Aspect and object-fit classes, applied to both the image and the stand-in. */
  imageClass?: string
  eager?: boolean
}>(), {
  src: '',
  sizes: '',
  imageClass: '',
  eager: false,
})
</script>

<template>
  <NuxtImg
    v-if="src"
    :src="src"
    :provider="imageProvider(src)"
    alt=""
    aria-hidden="true"
    :width="width"
    :height="height"
    :sizes="sizes || undefined"
    densities="1x"
    :class="imageClass"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : undefined"
    :preload="eager ? { fetchPriority: 'high' } : undefined"
  />
  <!-- Not aria-hidden: it is decorative once a real image replaces it, but
       while it is here it is the only thing standing in for one. -->
  <div
    v-else
    class="cms-image-placeholder"
    :class="imageClass"
  />
</template>

<style scoped>
/* Deliberately quiet - a slot waiting to be filled, not an error. The hatch
   matches the one CmsBlockShell uses for a block that renders nothing. */
.cms-image-placeholder {
  background-color: rgb(0 0 0 / 4%);
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 7px,
    rgb(0 0 0 / 4%) 7px,
    rgb(0 0 0 / 4%) 14px
  );
}
</style>
