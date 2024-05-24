<script lang="ts" setup>
import { SfButton, SfIconClose, SfModal } from "@storefront-ui/vue";

const { isSearchModalOpen, searchModalClose } = useSearch();
const { wishlistSidebarIsOpen, toggleWishlistSideBar } = useUiState();
</script>

<template>
  <TheHeader />

  <main class="w-full narrow-container bg-white">
    <NuxtPage :page-key="(route) => route.fullPath" />
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
