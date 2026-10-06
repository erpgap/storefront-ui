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
import { SfButton, SfIconInfo } from '@storefront-ui/vue'
import { parseRichText } from '../utils/richText'
import { spacingClass, type BlockSpacing } from '../utils/spacing'

const props = withDefaults(defineProps<{
  variant?: 'text' | 'notice'
  eyebrow?: string
  title?: string
  body?: string
  align?: 'center' | 'left'
  width?: 'column' | 'wide'
  size?: 'body' | 'intro' | 'lead'
  spacing?: BlockSpacing
  divider?: boolean
  ctaLabel?: string
  ctaUrl?: string
  ctaPosition?: 'below' | 'beside'
}>(), {
  variant: 'text',
  eyebrow: '',
  title: '',
  body: '',
  align: 'center',
  width: 'column',
  size: 'body',
  spacing: 'normal',
  divider: false,
  ctaLabel: '',
  ctaUrl: '',
  ctaPosition: 'below',
})

const NuxtLink = resolveComponent('NuxtLink')

const paragraphs = computed(() => parseRichText(props.body))
const centred = computed(() => props.align === 'center')
const beside = computed(() => props.ctaPosition === 'beside' && Boolean(props.ctaLabel && props.ctaUrl))

// A standalone section gets a section-sized heading; one that continues a
// flow of text gets a sub-heading, as a page's h2s were sized before.
const titleClass = computed(() =>
  props.spacing === 'normal' || beside.value
    ? 'text-[clamp(26px,3.2vw,42px)] mb-5'
    : 'text-[24px] mb-4')

const paragraphClass = computed(() => ({
  body: 'leading-relaxed text-primary-500',
  intro: 'text-[clamp(16px,1.6vw,19px)] leading-relaxed text-primary-600',
  lead: 'text-[clamp(20px,2.4vw,30px)] leading-snug tracking-[-0.01em] text-black',
}[props.size]))

const isInternal = (href: string) => href.startsWith('/')
</script>

<template>
  <!-- The rule spans the page even when the text sits in the reading column. -->
  <div :class="divider ? 'border-t border-primary-100' : ''">
    <section
      class="narrow-container"
      :class="[width === 'column' ? 'max-w-[820px]' : '', spacingClass(spacing)]"
    >
      <!-- Notice: a boxed aside, the title in bold leading into the text. -->
      <aside
        v-if="variant === 'notice'"
        class="flex items-start gap-3 border border-primary-100 bg-primary-50 p-4 text-[13px] text-primary-500"
        :class="width === 'wide' ? 'max-w-[820px]' : ''"
      >
        <SfIconInfo
          size="sm"
          class="shrink-0 mt-0.5 text-primary-400"
        />
        <div>
          <p
            v-for="(paragraph, index) in paragraphs"
            :key="index"
            class="mb-2 last:mb-0"
          >
            <span
              v-if="index === 0 && title"
              class="font-medium text-primary-700"
            >{{ `${title} ` }}</span>
            <CmsInlineText :parts="paragraph.kind === 'p' ? paragraph.parts : paragraph.items.flat()" />
          </p>
        </div>
      </aside>

      <div
        v-else
        :class="[
          centred ? 'max-w-[680px] mx-auto text-center' : '',
          width === 'wide' && !centred ? 'max-w-[820px]' : '',
          beside ? 'md:flex md:items-end md:justify-between md:gap-8' : '',
        ]"
      >
        <div>
          <p
            v-if="eyebrow"
            class="text-[12px] tracking-[0.22em] uppercase font-medium text-primary-400 mb-5"
          >
            {{ eyebrow }}
          </p>
          <h2
            v-if="title"
            class="font-light tracking-[-0.02em]"
            :class="titleClass"
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
              :class="centred ? 'inline-block text-left' : ''"
            >
              <li
                v-for="(item, itemIndex) in paragraph.items"
                :key="itemIndex"
                class="flex gap-3"
              >
                <span class="text-black">·</span>
                <span><CmsInlineText :parts="item" /></span>
              </li>
            </ul>
            <p
              v-else
              class="font-light mb-4 last:mb-0"
              :class="[paragraphClass, beside ? 'max-w-[440px]' : '']"
            >
              <CmsInlineText :parts="paragraph.parts" />
            </p>
          </template>
        </div>
        <SfButton
          v-if="ctaLabel && ctaUrl"
          :tag="isInternal(ctaUrl) ? NuxtLink : 'a'"
          :to="isInternal(ctaUrl) ? ctaUrl : undefined"
          :href="isInternal(ctaUrl) ? undefined : ctaUrl"
          :target="isInternal(ctaUrl) ? undefined : '_blank'"
          :rel="isInternal(ctaUrl) ? undefined : 'noopener'"
          class="shrink-0 min-h-[52px] px-7 gap-3 text-[13px] font-medium"
          :class="beside ? 'mt-8 md:mt-0' : 'mt-8'"
        >
          {{ ctaLabel }}
          <svg
            width="18"
            height="14"
            viewBox="0 0 18 14"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            aria-hidden="true"
          >
            <path
              d="M1 7h15M11 1l5 6-5 6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </SfButton>
      </div>
    </section>
  </div>
</template>
