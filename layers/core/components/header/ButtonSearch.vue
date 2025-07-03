<script setup lang="ts">
import {
  SfButton,
  useDisclosure,
  SfIconSearch,
} from '@storefront-ui/vue'

const { isOpen, close, open, toggle } = useDisclosure()
</script>

<template>
  <SfButton
    variant="tertiary"
    class="relative text-white hover:text-white active:text-white hover:bg-primary-800 active:bg-primary-900 rounded-md"
    square
    @click="toggle"
  >
    <SfIconSearch />
  </SfButton>
  <LazyMobileMenu
    :is-open="isOpen"
    @close="close"
  />
</template>

<style scoped></style>
