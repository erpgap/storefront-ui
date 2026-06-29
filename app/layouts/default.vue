<script lang="ts" setup>

const { loadWishlist } = useWishlist()
if (import.meta.client) onMounted(() => { loadWishlist() })

</script>

<template>
  <TheHeader />

  <main>
    <slot />
  </main>

  <LazyTheFooter hydrate-on-visible />

  <!-- Off-screen drawers: render server-side but defer hydration to idle time
       so their JS doesn't compete with the initial render. Idle fires well
       before a user opens them. -->
  <LazyWishlistSidebar hydrate-on-idle />
  <LazyCartSidebar hydrate-on-idle />
</template>
