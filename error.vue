<script setup lang="ts">
import { SfButton, SfIconArrowBack } from '@storefront-ui/vue'

const NuxtLink = resolveComponent('NuxtLink')
const error = useError()
</script>

<template>
  <NuxtLayout>
    <div
      v-if="error?.message === 'Product not found' || error?.statusCode === 404"
      class="flex flex-col justify-center items-center"
    >
      <NuxtImg
        src="/images/something-went-wrong.svg"
        :alt="$t('emptyStateAltText')"
        width="300"
        height="300"
      />
      <p class="mt-8 font-medium">
        Page Not Found
      </p>
      <div class="my-10">
        <SfButton
          to="/category/53"
          class="hidden md:flex"
          variant="secondary"
          :tag="NuxtLink"
        >
          <template #prefix>
            <SfIconArrowBack />
          </template>
          {{ $t("backToShopping") }}
        </SfButton>
      </div>
    </div>
    <div v-else>
      <NuxtImg
        class="mx-auto"
        src="/images/something-went-wrong.svg"
        :alt="$t('emptyStateAltText')"
        width="300"
        height="300"
      />
      <p class="mt-8 text-center font-medium">
        Some problem happened
      </p>
      <div class="my-10">
        <SfButton
          to="/category/53"
          class="hidden md:flex"
          variant="secondary"
          :tag="NuxtLink"
        >
          <template #prefix>
            <SfIconArrowBack />
          </template>
          {{ $t("backToShopping") }}
        </SfButton>
      </div>
    </div>
  </NuxtLayout>
</template>
