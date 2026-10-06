<script setup lang="ts">
// The `infoRows` block: a name and two details per row, such as delivery
// options with their time and cost.
import { spacingClass, type BlockSpacing } from '../utils/spacing'

withDefaults(defineProps<{
  title?: string
  spacing?: BlockSpacing
  items?: { label: string, value?: string, note?: string }[]
}>(), {
  title: '',
  spacing: 'compact',
  items: () => [],
})
</script>

<template>
  <section
    class="narrow-container max-w-[820px]"
    :class="spacingClass(spacing)"
  >
    <div>
      <h2
        v-if="title"
        class="mb-6 text-[24px] font-light tracking-[-0.01em]"
      >
        {{ title }}
      </h2>
      <div class="border-t border-primary-100">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-1 sm:gap-6 py-5 border-b border-primary-100"
        >
          <span class="font-medium">{{ item.label }}</span>
          <span class="text-primary-500">{{ item.value }}</span>
          <span class="text-primary-500 sm:text-right">{{ item.note }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
