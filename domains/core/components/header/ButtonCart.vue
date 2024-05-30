<script lang="ts" setup>
import { SfButton, SfBadge } from "@storefront-ui/vue";

const NuxtLink = resolveComponent("NuxtLink");
const { loadCart, totalItemsInCart } = useCart();

onMounted(async () => {
  await loadCart(true);
});
</script>

<template>
  <ClientOnly>
    <SfButton
      class="group relative text-white hover:text-white active:text-white hover:bg-primary-800 active:bg-primary-900 rounded-md"
      :tag="NuxtLink"
      to="/cart"
      variant="tertiary"
      square
    >
      <template #prefix>
        <Icon
          :name="totalItemsInCart > 0 ? 'ion:cart-sharp' : 'ion:cart-outline'"
          size="22px"
        />
        <SfBadge
          :content="totalItemsInCart"
          class="outline outline-primary-700 bg-white !text-neutral-900 group-hover:outline-primary-800 group-active:outline-primary-900 flex justify-center"
          data-testid="cart-badge"
        />
      </template>
    </SfButton>

    <template #fallback>
      <SfButton
        class="group relative text-white hover:text-white active:text-white hover:bg-primary-800 active:bg-primary-900 rounded-md"
        :tag="NuxtLink"
        to="/cart"
        variant="tertiary"
        square
      >
        <template #prefix>
          <Icon name="ion:cart-outline" size="22px" />
          <SfBadge
            :content="0"
            class="outline outline-primary-700 bg-white !text-neutral-900 group-hover:outline-primary-800 group-active:outline-primary-900 flex justify-center"
            data-testid="cart-badge"
          />
        </template>
      </SfButton>
    </template>
  </ClientOnly>
</template>
