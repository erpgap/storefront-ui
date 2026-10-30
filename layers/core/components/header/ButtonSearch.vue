<script setup lang="ts">
import { SfButton, useDisclosure } from '@storefront-ui/vue'

// The mobile header's search: opens the search layer's full-screen drawer.
const { isOpen, close, toggle } = useDisclosure()
</script>

<template>
  <SfButton
    variant="tertiary"
    square
    :aria-label="$t('search')"
    :aria-expanded="isOpen"
    class="text-black hover:bg-white active:bg-white rounded-md"
    @click="toggle()"
  >
    <UiLineIcon
      name="search"
      class="text-black!"
    />
  </SfButton>
  <LazyHeaderSearchDrawer
    :is-open="isOpen"
    @close="close"
  />
</template>
