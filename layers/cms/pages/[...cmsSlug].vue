<script setup lang="ts">
// The catch-all (§4.2 gap 3).
//
// `modules/routes-generator` runs at BUILD time, so a page a merchant creates
// this afternoon is unreachable until the next deploy — which defeats the whole
// point of letting them create pages. This route closes that gap: Vue Router
// matches a catch-all last, so it only ever sees URLs no real route claimed.
//
// It does not decide what those URLs are. `catchAll` tells the app's
// dynamic-routes middleware to look the URL up in Redis first, which 404s
// unknown ones and sends new products and categories to their own pages, so
// only published CMS pages get this far.
import CmsPage from '../custom-pages/cms-page.vue'

definePageMeta({ catchAll: true })
</script>

<template>
  <CmsPage />
</template>
