<script setup lang="ts">
import { SfIconInfo } from '@storefront-ui/vue'
</script>

<template>
  <aside class="flex items-start gap-3 border border-primary-100 bg-primary-50 p-4 text-[13px] text-primary-500">
    <SfIconInfo size="sm" class="shrink-0 mt-0.5 text-primary-400" />
    <p>
      <span class="font-medium text-primary-700">Demo store.</span>
      Alokai is a showcase storefront by
      <a href="https://www.erpgap.com/alokai/" target="_blank" rel="noopener" class="underline hover:text-black">ERPGAP</a>.
      The information on this page is illustrative only — no real orders, shipments, or payments are processed.
    </p>
  </aside>
</template>
