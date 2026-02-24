<script lang="ts" setup>

const { loadWishlist } = useWishlist()
if (import.meta.client) onMounted(() => { loadWishlist() })

</script>

<template>
  <TheHeader />

  <slot />

  <LazyNewsletter />

  <LazyTheFooter hydrate-on-visible />

  <WishlistSidebar />
</template>
