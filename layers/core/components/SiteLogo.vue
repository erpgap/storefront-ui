<script setup lang="ts">
import { logoHeightEm } from '../utils/logoSize'

// The store's logo, as set in Odoo (Website > Settings > Logo), or the
// storefront's own text logo without one. Sized in em, so where it is used
// sets its size with the font size, as for the text logo.
//
// Its width and height come with the page, so it keeps its place before the
// image loads; the image is a small file browsers keep for good (its
// address changes with it), and it never holds the page up. Fetched at low
// priority: as an image near the top it went at high, sharing the line with
// the page's main image and painting that 200-300 ms later on mobile.
interface Logo {
  src: string
  width: number
  height: number
  alt: string
}

const { data: logo } = await useFetch<Logo | null>('/api/website-logo', {
  key: 'website-logo',
  // Once loaded, kept for the visit: header, footer and checkout share it.
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
})

// A wide logo (a wordmark) as tall as the capitals of the text logo it
// stands for; a squarer one up to 1.5em tall, not wider than the text was.
const heightEm = computed(() => logo.value
  ? Math.min(1.5, logoHeightEm(logo.value.width / logo.value.height))
  : 0)
</script>

<template>
  <img
    v-if="logo"
    :src="logo.src"
    :width="logo.width"
    :height="logo.height"
    :alt="logo.alt"
    class="block w-auto max-w-none"
    :style="{ height: `${heightEm}em` }"
    decoding="async"
    fetchpriority="low"
  >
  <AlokaiLogo v-else />
</template>
