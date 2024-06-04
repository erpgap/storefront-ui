<script setup lang="ts">
import { SfButton } from "@storefront-ui/vue";
defineProps({
  page: {
    type: Number,
    default: 0,
  },
});
</script>
<template>
  <section>
    <div
      data-testid="category-empty-state"
      class="flex flex-col items-center md:mt-16"
    >
      <NuxtImg
        src="/images/something-went-wrong.svg"
        :alt="$t('emptyStateAltText')"
        width="300"
        height="300"
      />
      <p class="mt-8 font-medium">{{ $t("emptyStateText3", { page }) }}</p>
      <SfButton class="mt-8 mb-20" variant="secondary" @click="$router.back()">
        <template #prefix>
          <SfIconArrowBack />
        </template>
        {{ $t("returnPreviousPage") }}
      </SfButton>
    </div>
  </section>
</template>
