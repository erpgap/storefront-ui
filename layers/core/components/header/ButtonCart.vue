<script lang="ts" setup>
import { SfButton } from "@storefront-ui/vue";

const { loadCart, totalItemsInCart } = useCart();
const { toggleCartSideBar } = useCartUiState();

onMounted(() => {
  loadCart();
});
</script>

<template>
  <ClientOnly>
    <SfButton
      class="group relative text-black hover:bg-white active:bg-white rounded-md"
      type="button"
      variant="tertiary"
      square
      aria-label="Open cart"
      @click="toggleCartSideBar()"
    >
      <template #prefix>
        <span class="relative inline-flex">
          <UiLineIcon name="cart" class="!text-black" />
          <span
            v-if="totalItemsInCart > 0"
            class="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-black text-white text-[10px] leading-none font-medium flex items-center justify-center"
            data-testid="cart-badge"
            >{{ totalItemsInCart }}</span
          >
        </span>
      </template>
    </SfButton>

    <template #fallback>
      <SfButton
        class="group relative text-black hover:bg-white active:bg-white rounded-md"
        type="button"
        variant="tertiary"
        square
        aria-label="Open cart"
      >
        <template #prefix>
          <UiLineIcon name="cart" class="!text-black" />
        </template>
      </SfButton>
    </template>
  </ClientOnly>
</template>
