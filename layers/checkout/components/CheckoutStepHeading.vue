<script setup lang="ts">
// A checkout section's numbered heading: a tick once the section is done, red
// while the shopper is told to fix it.
defineProps<{
  step?: number | string
  heading?: string
  done?: boolean
  invalid?: boolean
}>()
</script>

<template>
  <div class="flex items-center gap-3 mb-5">
    <span
      v-if="step"
      :class="[
        'w-[26px] h-[26px] rounded-full grid place-items-center text-[12px] shrink-0',
        done ? 'bg-black text-white'
        : invalid ? 'border border-red-300 text-red-600'
          : 'border border-primary-200 text-primary-500',
      ]"
    >
      <template v-if="done">✓</template>
      <template v-else>{{ step }}</template>
    </span>
    <h2 class="text-[13px] tracking-[0.14em] uppercase font-semibold">
      {{ heading }}
    </h2>
  </div>
</template>
