<script setup lang="ts">
// A storefront section's heading: the small label above, the title, and on
// wide screens a "view all" link on the right.
defineProps<{
  eyebrow?: string
  title?: string
  linkLabel?: string
  linkUrl?: string
}>()
</script>

<template>
  <div class="flex items-end justify-between gap-6 mb-12">
    <div>
      <p
        v-if="eyebrow"
        class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400 mb-3.5"
      >
        {{ eyebrow }}
      </p>
      <h2 class="font-light tracking-[-0.02em] text-[clamp(28px,3.4vw,44px)]">
        {{ title }}
      </h2>
    </div>
    <NuxtLink
      v-if="linkLabel"
      :to="linkUrl || '/products'"
      class="group hidden sm:inline-flex items-center gap-2 pb-2 text-[13px] tracking-widest uppercase text-primary-600 whitespace-nowrap border-b border-transparent transition-colors hover:text-black hover:border-black"
    >
      {{ linkLabel }}
      <UiIconArrowRight :width="16" />
    </NuxtLink>
  </div>
</template>
