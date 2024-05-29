<script lang="ts" setup>
const { wishlistSidebarIsOpen, toggleWishlistSideBar } = useUiState();
</script>

<template>
  <TheHeader />

  <main class="w-full narrow-container bg-white">
    <slot></slot>
  </main>

  <LazyNewsletter />
  <NuxtLazyHydrate when-visible>
    <LazyBottomNavbar />
  </NuxtLazyHydrate>
  <NuxtLazyHydrate when-visible>
    <LazyTheFooter />
  </NuxtLazyHydrate>

  <WishlistSidebar
    :is-open="wishlistSidebarIsOpen"
    @close="toggleWishlistSideBar"
  />
</template>
