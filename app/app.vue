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
</script>
