<script setup lang="ts">
// The catch-all (§4.2 gap 3).
//
// `modules/routes-generator` runs at BUILD time, so a page a merchant creates
// this afternoon is unreachable until the next deploy — which defeats the whole
// point of letting them create pages. This route closes that gap: Vue Router
// matches a catch-all last, so it only ever sees URLs no real route claimed,
// and cms-page.vue throws a 404 for URLs with no published page behind them.
import CmsPage from '../custom-pages/cms-page.vue'
</script>

<template>
  <CmsPage />
</template>
