<template>
  <NuxtLayout name="auth">
    <div
      class="mx-auto text-center rounded-md border border-neutral-200 p-4 md:p-6 mt-2"
    >
      <div
        class="w-full min-h-[330px] flex flex-col gap-4 items-center justify-center"
      >
        <Icon
          name="i-material-symbols-check-circle"
          class="size-20 text-primary-700"
        />
        <h1 class="text-3xl font-bold">Your request has ben sent!</h1>
        <p>You just received a reply in your registered email.</p>
        <SfButton @click="navigateTo('/')" size="lg" variant="secondary">
          Continue shopping
        </SfButton>
      </div>
    </div>
  </NuxtLayout>
</template>
<script setup lang="ts">
import { SfButton } from "@storefront-ui/vue";

definePageMeta({
  layout: false,
});

const email = ref("hieronim.anonim@gmail.com");
const NuxtLink = resolveComponent("NuxtLink");
</script>
