<script setup lang="ts">
const error = useError();
</script>
<template>
  123
  <NuxtLayout>
    <h1>{{ error?.message }}</h1>
    <p>It looks like something broke.</p>
    <p>Sorry about that.</p>
    <div>
      <h1>Dang</h1>
      <p>It looks like something broke.</p>
      <p>Sorry about that.</p>
    </div>
  </NuxtLayout>
</template>
