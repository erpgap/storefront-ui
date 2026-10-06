<script setup lang="ts">
// The `featureList` block: short numbered points in columns - an about page's
// principles, a returns page's steps. 'band' is a full-width section between
// two rules; 'column' sits in the reading column with the text around it.
const props = withDefaults(defineProps<{
  title?: string
  layout?: 'band' | 'column'
  numberPosition?: 'beside' | 'above'
  columns?: '2' | '3'
  numbered?: boolean
  items?: { title: string, text?: string }[]
}>(), {
  title: '',
  layout: 'band',
  numberPosition: 'beside',
  columns: '3',
  numbered: true,
  items: () => [],
})

const band = computed(() => props.layout === 'band')

const gridClass = computed(() => {
  if (!band.value) return 'sm:grid-cols-2 gap-x-10 gap-y-8'
  return props.columns === '2'
    ? 'md:grid-cols-2 gap-x-12 gap-y-10'
    : 'md:grid-cols-3 gap-y-10 md:gap-x-12'
})

const number = (index: number) => String(index + 1).padStart(2, '0')
</script>

<template>
  <section :class="band ? 'border-y border-primary-100' : ''">
    <div
      class="narrow-container"
      :class="band ? 'py-[clamp(48px,6vw,88px)]' : 'max-w-[820px] pb-[clamp(40px,4.5vw,56px)]'"
    >
      <h2
        v-if="title"
        class="font-light tracking-[-0.01em] text-[24px]"
        :class="band ? 'mb-10' : 'mb-8'"
      >
        {{ title }}
      </h2>
      <ol
        class="grid grid-cols-1"
        :class="gridClass"
      >
        <li
          v-for="(item, index) in items"
          :key="index"
          :class="numberPosition === 'beside' ? 'flex' : ''"
          :style="numberPosition === 'beside' ? { gap: band ? '1.25rem' : '1rem' } : undefined"
        >
          <span
            v-if="numbered"
            class="text-[13px] font-medium text-primary-300"
            :class="numberPosition === 'above' ? 'block mb-4' : 'pt-1'"
          >{{ number(index) }}</span>
          <div>
            <h3
              class="font-medium"
              :class="band ? 'text-[20px] mb-2' : 'mb-1.5'"
            >
              {{ item.title }}
            </h3>
            <p
              v-if="item.text"
              class="text-primary-500 font-light leading-relaxed max-w-[440px]"
              :class="band ? '' : 'text-[14px]'"
            >
              {{ item.text }}
            </p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
