<script setup lang="ts">
// The `stats` block: a row of big figures with a label under each.
withDefaults(defineProps<{
  items?: { value: string, label?: string }[]
}>(), {
  items: () => [],
})
</script>

<template>
  <section class="narrow-container py-[clamp(48px,6vw,88px)]">
    <dl
      class="grid gap-6 text-center"
      :style="{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
      >
        <dd class="text-[clamp(32px,5vw,56px)] font-light tracking-[-0.02em]">
          {{ item.value }}
        </dd>
        <dt
          v-if="item.label"
          class="text-[12px] tracking-[0.14em] uppercase text-primary-400 mt-2"
        >
          {{ item.label }}
        </dt>
      </div>
    </dl>
  </section>
</template>
