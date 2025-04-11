<script lang="ts" setup></script>

<template>
  <TheHeader />

  <main class="w-full narrow-container bg-white">
    <slot />
  </main>

  <LazyNewsletter />

  <LazyBottomNavbar hydrate-on-visible />
  <LazyTheFooter hydrate-on-visible />

  <WishlistSidebar />
</template>
