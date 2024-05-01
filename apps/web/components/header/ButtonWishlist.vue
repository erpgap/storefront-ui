<script lang="ts" setup>
import { SfButton, SfBadge } from "@storefront-ui/vue";

const { wishlistTotalItems } = useWishlist();
const { toggleWishlistSideBar } = useUiState();
</script>
<template>
  <SfButton
    class="group relative text-white hover:text-white active:text-white hover:bg-primary-800 active:bg-primary-900 mr-1 -ml-0.5 rounded-md"
    type="button"
    variant="tertiary"
    square
    @click="toggleWishlistSideBar()"
  >
    <template #prefix>
      <Icon name="mdi:heart-outline" size="22px" />
      <SfBadge
        :content="wishlistTotalItems"
        class="outline outline-primary-700 bg-white !text-neutral-900 group-hover:outline-primary-800 group-active:outline-primary-900 flex justify-center"
        data-testid="wishlist-badge"
      />
    </template>
  </SfButton>
</template>
