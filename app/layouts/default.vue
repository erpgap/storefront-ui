<script lang="ts" setup>

const { loadWishlist } = useWishlist()
if (import.meta.client) onMounted(() => { loadWishlist() })

</script>

<template>
  <TheHeader />

  <slot />

  <LazyTheFooter hydrate-on-visible />

  <WishlistSidebar />
  <CartSidebar />
</template>
