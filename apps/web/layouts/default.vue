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

  <SfModal
    v-model="isSearchModalOpen"
    class="w-full h-full z-50"
    tag="section"
    role="dialog"
    aria-labelledby="search-modal-title"
  >
    <header class="mb-4">
      <SfButton
        square
        variant="tertiary"
        class="absolute right-4 top-2"
        @click="searchModalClose"
      >
        <SfIconClose class="text-neutral-500" />
      </SfButton>
      <h3
        id="search-modal-title"
        class="absolute left-6 top-4 font-bold typography-headline-4 mb-4"
      >
        {{ $t("search") }}
      </h3>
    </header>
    <UiSearch :close="searchModalClose" />
  </SfModal>
</template>
