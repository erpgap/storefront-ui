<script lang="ts" setup>
import {
  SfButton,
  SfModal,
  SfIconClose,
  useDisclosure,
} from '@storefront-ui/vue';

const {
  isOpen: isSearchModalOpen,
  open: searchModalOpen,
  close: searchModalClose,
} = useDisclosure();
</script>

<template>
  <TheHeader @search-modal-open="searchModalOpen" filled />
  <main class="w-full narrow-container bg-white">
      <NuxtPage :pageKey="route => route.fullPath" />
  </main>

  <Newsletter />
  <BottomNavbar />
  <TheFooter />
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
        {{ $t('search') }}
      </h3>
    </header>
    <UiSearch :close="searchModalClose" />
  </SfModal>
</template>
