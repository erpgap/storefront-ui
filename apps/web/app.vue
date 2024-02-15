<script setup>

const nuxtApp = useNuxtApp();

nuxtApp.hook('page:finish', () => {
  window.scrollTo(0, 0);
});
</script>
<template>
  <div class="h-screen justify-center align-middle">
    <NuxtLoadingIndicator color="white" :height="4" />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
