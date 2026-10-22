<template>
  <div class="min-h-screen justify-center align-middle">
    <NuxtLoadingIndicator
      color="white"
      :height="4"
    />

    <NuxtLayout>
      <NuxtPage :page-key="pageKey" />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Stable function identity. An inline `(route) => route.path` is a new function
// on every render of this component; NuxtPage watches `props.pageKey` and fires
// an (unpaired) `page:loading:start` whenever that identity changes, which leaves
// the top loading bar stuck on pages that re-render after navigation.
const pageKey = (route: { path: string }) => route.path

// Product images come from the Odoo image host, a different origin, and on
// listing and product pages one of them is the largest paint. Opening that
// connection while the HTML is still parsing saves its DNS and TLS setup
// from the critical path. No `crossorigin`: images are fetched without CORS,
// and a CORS-mode preconnect would be a different connection they cannot use.
const imageOrigin = (() => {
  try {
    return new URL(String(useRuntimeConfig().public.odooBaseImageUrl)).origin
  }
  catch {
    return null
  }
})()
if (imageOrigin) {
  useHead({ link: [{ rel: 'preconnect', href: imageOrigin }] })
}
</script>
