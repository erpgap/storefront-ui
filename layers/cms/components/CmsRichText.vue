<script setup lang="ts">
// A text section. The only block whose component is CMS-specific, because the
// storefront had no generic prose section to point at.
//
// `body` is rendered as TEXT, split on blank lines — never v-html. A merchant
// pasting markup cannot inject script, and the typography stays the design
// system's rather than whatever Word produced. Rich formatting is a TipTap
// field later (§9.3), and it will still be sanitised server-side.
const props = withDefaults(defineProps<{
  eyebrow?: string
  title?: string
  body?: string
  align?: 'center' | 'left'
}>(), {
  eyebrow: '',
  title: '',
  body: '',
  align: 'center',
})

const paragraphs = computed(() =>
  props.body.split(/\n{2,}/).map(part => part.trim()).filter(Boolean),
)
</script>

<template>
  <section class="narrow-container py-[clamp(56px,7vw,104px)]">
    <div
      class="max-w-[680px]"
      :class="align === 'center' ? 'mx-auto text-center' : ''"
    >
      <p
        v-if="eyebrow"
        class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400 mb-3.5"
      >
        {{ eyebrow }}
      </p>
      <h2
        v-if="title"
        class="font-light tracking-[-0.02em] text-[clamp(28px,3.4vw,44px)] mb-6"
      >
        {{ title }}
      </h2>
      <p
        v-for="(paragraph, index) in paragraphs"
        :key="index"
        class="font-light text-primary-500 leading-relaxed mb-4 last:mb-0"
      >
        {{ paragraph }}
      </p>
    </div>
  </section>
</template>
