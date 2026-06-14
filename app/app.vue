<template>
  <div class="min-h-screen justify-center align-middle">
    <NuxtLoadingIndicator
      color="white"
      :height="4"
    />

    <NuxtLayout>
      <NuxtPage :page-key="(route) => route.path" />
    </NuxtLayout>
  </div>
</template>
