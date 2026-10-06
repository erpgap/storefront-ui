<script setup lang="ts">
// A text section. The storefront had no generic prose section to point at, so
// this one is CMS-specific.
//
// `body` is rendered as TEXT, never v-html. A merchant pasting markup cannot
// inject script, and the typography stays the design system's rather than
// whatever Word produced. The little formatting there is - paragraphs, "- "
// lists and [label](url) links - is parsed into nodes here, and a link only
// becomes a link when its target is a path, http(s), mailto: or tel:. Rich
// formatting is a TipTap field later (§9.3), and it will still be sanitised
// server-side.
import { SfButton } from '@storefront-ui/vue'
import { parseRichText } from '../utils/richText'

const props = withDefaults(defineProps<{
  eyebrow?: string
  title?: string
  body?: string
  align?: 'center' | 'left'
  size?: 'body' | 'lead'
  spacing?: 'normal' | 'compact'
  ctaLabel?: string
  ctaUrl?: string
}>(), {
  eyebrow: '',
  title: '',
  body: '',
  align: 'center',
  size: 'body',
  spacing: 'normal',
  ctaLabel: '',
  ctaUrl: '',
})

const NuxtLink = resolveComponent('NuxtLink')

const paragraphs = computed(() => parseRichText(props.body))

const isInternal = (href?: string) => Boolean(href?.startsWith('/'))
</script>

<template>
  <!-- Inline links stay on one line with their text: a line break inside an
       <a> renders as a space, which would underline it and push punctuation
       away ("FAQ ."). -->
  <!-- eslint-disable vue/singleline-html-element-content-newline, vue/multiline-html-element-content-newline -->
  <section
    class="narrow-container"
    :class="spacing === 'compact' ? 'pb-[clamp(32px,4vw,56px)]' : 'py-[clamp(56px,7vw,104px)]'"
  >
    <div
      :class="[
        size === 'lead' ? 'max-w-[820px]' : 'max-w-[680px]',
        align === 'center' ? 'mx-auto text-center' : '',
      ]"
    >
      <p
        v-if="eyebrow"
        class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400 mb-3.5"
      >
        {{ eyebrow }}
      </p>
      <h2
        v-if="title"
        class="font-light tracking-[-0.02em] mb-6"
        :class="spacing === 'compact' ? 'text-[24px]' : 'text-[clamp(28px,3.4vw,44px)]'"
      >
        {{ title }}
      </h2>
      <template
        v-for="(paragraph, index) in paragraphs"
        :key="index"
      >
        <ul
          v-if="paragraph.kind === 'ul'"
          class="space-y-2.5 font-light text-primary-600 mb-4 last:mb-0"
          :class="align === 'center' ? 'inline-block text-left' : ''"
        >
          <li
            v-for="(item, itemIndex) in paragraph.items"
            :key="itemIndex"
            class="flex gap-3"
          >
            <span class="text-black">·</span>
            <span>
              <template
                v-for="(part, partIndex) in item"
                :key="partIndex"
              >
                <component
                  :is="isInternal(part.href) ? NuxtLink : 'a'"
                  v-if="part.href"
                  :to="isInternal(part.href) ? part.href : undefined"
                  :href="isInternal(part.href) ? undefined : part.href"
                  class="underline hover:text-black"
                >{{ part.text }}</component>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
          </li>
        </ul>
        <p
          v-else
          class="font-light mb-4 last:mb-0"
          :class="size === 'lead'
            ? 'text-[clamp(20px,2.4vw,30px)] leading-snug tracking-[-0.01em] text-black'
            : 'leading-relaxed text-primary-500'"
        >
          <template
            v-for="(part, partIndex) in paragraph.parts"
            :key="partIndex"
          >
            <component
              :is="isInternal(part.href) ? NuxtLink : 'a'"
              v-if="part.href"
              :to="isInternal(part.href) ? part.href : undefined"
              :href="isInternal(part.href) ? undefined : part.href"
              class="underline hover:text-black"
            >{{ part.text }}</component>
            <template v-else>{{ part.text }}</template>
          </template>
        </p>
      </template>
      <SfButton
        v-if="ctaLabel && ctaUrl"
        :tag="isInternal(ctaUrl) ? NuxtLink : 'a'"
        :to="isInternal(ctaUrl) ? ctaUrl : undefined"
        :href="isInternal(ctaUrl) ? undefined : ctaUrl"
        class="mt-8 min-h-[52px] px-7 text-[13px] font-medium"
      >
        {{ ctaLabel }}
      </SfButton>
    </div>
  </section>
</template>
