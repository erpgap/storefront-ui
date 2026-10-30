<template>
  <NuxtLayout name="auth">
    <div
      class="mx-auto text-center border border-primary-100 p-6 md:p-8 mt-2"
    >
      <div
        class="w-full min-h-[330px] flex flex-col gap-4 items-center justify-center"
      >
        <Icon
          name="ion:checkmark-circle"
          class="size-20 text-primary-700"
        />
        <h1 class="text-3xl font-bold">
          {{ $t("auth.resetPasswordSuccess.heading") }}
        </h1>
        <p>{{ $t("auth.resetPasswordSuccess.info") }}</p>
        <SfButton
          size="lg"
          variant="secondary"
          @click="navigateTo('/')"
        >
          {{ $t("continueShopping") }}
        </SfButton>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { SfButton } from '@storefront-ui/vue'

definePageMeta({
  layout: false,
})

const email = ref('hieronim.anonim@gmail.com')
const NuxtLink = resolveComponent('NuxtLink')
</script>
