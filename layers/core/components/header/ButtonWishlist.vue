<script lang="ts" setup>
import { SfButton } from '@storefront-ui/vue'

const { toggleWishlistSideBar } = useWishlistUiState()
const { loadWishlist, wishlistTotalItems } = useWishlist()

const handleOpenWishListSidebar = async () => {
  toggleWishlistSideBar()
  await loadWishlist()
}

onMounted(async () => {
  await loadWishlist()
})
</script>

<template>
  <ClientOnly>
    <SfButton
      class="group relative text-black hover:bg-white active:bg-white rounded-md"
      type="button"
      variant="tertiary"
      square
      @click="handleOpenWishListSidebar"
    >
      <template #prefix>
        <span class="relative inline-flex">
          <UiLineIcon name="heart" :filled="wishlistTotalItems > 0" class="!text-black" />
          <span
            v-if="wishlistTotalItems > 0"
            class="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-black text-white text-[10px] leading-none font-medium flex items-center justify-center"
            data-testid="wishlist-badge"
          >{{ wishlistTotalItems }}</span>
        </span>
      </template>
    </SfButton>

    <template #fallback>
      <SfButton
        class="group relative text-black hover:bg-white active:bg-white mr-1 -ml-0.5 rounded-md"
        type="button"
        variant="tertiary"
        square
      >
        <template #prefix>
          <UiLineIcon name="heart" class="!text-black" />
        </template>
      </SfButton>
    </template>
  </ClientOnly>
</template>
