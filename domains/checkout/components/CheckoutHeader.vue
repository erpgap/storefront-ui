<template>
  <div class="flex justify-between mt-8 mb-10">
    <h1 class="font-bold typography-headline-3 md:typography-headline-2">
      {{ title }}
    </h1>

    <SfButton
      :tag="NuxtLink"
      :to="backLink"
      class="flex md:hidden whitespace-nowrap"
      size="sm"
      variant="tertiary"
    >
      <template #prefix>
        <SfIconArrowBack />
      </template>
      {{ backTextMobile }}
    </SfButton>

    <SfButton
      :tag="NuxtLink"
      :to="backLink"
      class="hidden md:flex"
      variant="tertiary"
    >
      <template #prefix>
        <SfIconArrowBack />
      </template>
      {{ backTextDesktop }}
    </SfButton>
  </div>
</template>

<script setup lang="ts">
import { SfButton, SfIconArrowBack } from "@storefront-ui/vue";
const NuxtLink = resolveComponent("NuxtLink");

defineProps({
  title: {
    type: String,
    default: "Checkout",
  },
  backLink: {
    type: String,
    default: "/cart",
  },
  backTextMobile: {
    type: String,
    default: "Back",
  },
  backTextDesktop: {
    type: String,
    default: "Back to Cart",
  },
});
</script>
