<script lang="ts" setup></script>

<template>
  <TheHeader />

  <slot />

  <LazyNewsletter />

  <LazyTheFooter hydrate-on-visible />

  <WishlistSidebar />
</template>
