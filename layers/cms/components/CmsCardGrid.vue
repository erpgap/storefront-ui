<script setup lang="ts">
// The `cardGrid` block: image cards with a title and text - stores, journal
// stories, a team. A card with a link is a link; one without is not, so a
// list of stores does not pretend to be clickable.
import { spacingClass, type BlockSpacing } from '../utils/spacing'

const props = withDefaults(defineProps<{
  title?: string
  spacing?: BlockSpacing
  columns?: '2' | '3'
  imageShape?: 'classic' | 'wide'
  items?: {
    image: string
    eyebrow?: string
    date?: string
    title: string
    text?: string
    footnote?: string
    link?: string
  }[]
}>(), {
  title: '',
  spacing: 'normal',
  columns: '3',
  imageShape: 'classic',
  items: () => [],
})

const NuxtLink = resolveComponent('NuxtLink')

const gridClass = computed(() =>
  props.columns === '2' ? 'md:grid-cols-2 gap-x-8 gap-y-14' : 'md:grid-cols-3 gap-x-6 gap-y-12')
const aspectClass = computed(() =>
  props.imageShape === 'wide' ? 'aspect-[16/10]' : 'aspect-[4/3]')
const imageSizes = computed(() =>
  props.columns === '2'
    ? 'xs:100vw sm:100vw md:50vw lg:50vw xl:50vw xxl:50vw 2xl:50vw'
    : 'xs:100vw sm:100vw md:33vw lg:33vw xl:33vw xxl:33vw 2xl:33vw')

const cardTag = (link?: string) => {
  if (!link) return 'article'
  return link.startsWith('/') ? NuxtLink : 'a'
}
</script>

<template>
  <section
    class="narrow-container"
    :class="spacingClass(spacing)"
  >
    <h2
      v-if="title"
      class="mb-10 text-[24px] font-light tracking-[-0.01em]"
    >
      {{ title }}
    </h2>
    <div
      class="grid grid-cols-1"
      :class="gridClass"
    >
      <component
        :is="cardTag(item.link)"
        v-for="(item, index) in items"
        :key="index"
        :to="item.link?.startsWith('/') ? item.link : undefined"
        :href="item.link && !item.link.startsWith('/') ? item.link : undefined"
        class="group block"
      >
        <div class="overflow-hidden rounded-[3px] mb-5">
          <CmsImage
            :src="item.image"
            :width="1344"
            :height="1008"
            :sizes="imageSizes"
            :image-class="[
              'w-full object-cover',
              aspectClass,
              item.link ? 'transition-transform duration-700 ease-out group-hover:scale-105' : '',
            ].filter(Boolean).join(' ')"
          />
        </div>
        <p
          v-if="item.eyebrow || item.date"
          class="flex items-center gap-3 text-[12px] tracking-[0.14em] uppercase text-primary-400 mb-3"
        >
          <span v-if="item.eyebrow">{{ item.eyebrow }}</span>
          <span
            v-if="item.eyebrow && item.date"
            class="w-1 h-1 rounded-full bg-primary-300"
            aria-hidden="true"
          />
          <span v-if="item.date">{{ item.date }}</span>
        </p>
        <h3
          class="font-light tracking-[-0.01em] mb-2"
          :class="[columns === '2' ? 'text-[24px]' : 'text-[22px]', item.link ? 'group-hover:underline underline-offset-4' : '']"
        >
          {{ item.title }}
        </h3>
        <p
          v-if="item.text"
          class="text-primary-500 font-light leading-relaxed max-w-[520px]"
        >
          {{ item.text }}
        </p>
        <p
          v-if="item.footnote"
          class="text-[13px] tracking-[0.06em] uppercase text-primary-400 mt-3"
        >
          {{ item.footnote }}
        </p>
      </component>
    </div>
  </section>
</template>
