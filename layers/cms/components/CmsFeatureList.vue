<script setup lang="ts">
// The `featureList` block: short numbered points in columns - an about page's
// principles, a returns page's steps.
const props = withDefaults(defineProps<{
  title?: string
  columns?: '2' | '3'
  numbered?: boolean
  items?: { title: string, text?: string }[]
}>(), {
  title: '',
  columns: '3',
  numbered: true,
  items: () => [],
})

const gridClass = computed(() =>
  props.columns === '2' ? 'md:grid-cols-2' : 'md:grid-cols-3')
</script>

<template>
  <section class="border-y border-primary-100">
    <div class="narrow-container py-[clamp(48px,6vw,88px)]">
      <h2
        v-if="title"
        class="mb-10 text-[24px] font-light tracking-[-0.01em]"
      >
        {{ title }}
      </h2>
      <ol
        class="grid grid-cols-1 gap-y-10 md:gap-x-12"
        :class="gridClass"
      >
        <li
          v-for="(item, index) in items"
          :key="index"
          class="flex gap-5"
        >
          <span
            v-if="numbered"
            class="text-[13px] font-medium text-primary-300 pt-1"
          >{{ String(index + 1).padStart(2, '0') }}</span>
          <div>
            <h3 class="text-[20px] font-medium mb-2">
              {{ item.title }}
            </h3>
            <p
              v-if="item.text"
              class="text-primary-500 font-light leading-relaxed max-w-[440px]"
            >
              {{ item.text }}
            </p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
