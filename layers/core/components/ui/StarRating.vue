<script setup lang="ts">
// A rating as stars: grey outlines, and the filled ones over them up to the
// value, each layer one element masked with the star shape (tailwind.css,
// star-mask-*). Storefront UI's SfRating drew each star as two components
// with an SVG: eleven per rating, some 200 on a category page, a large part
// of what the page spent hydrating.
const props = withDefaults(defineProps<{
  value: number
  max?: number
}>(), { max: 5 })

const { t } = useI18n()
// Whole stars, as SfRating showed them.
const stars = computed(() => Math.min(Math.max(Math.round(props.value), 0), props.max))
const label = computed(() => t('core.ui.ratingLabel', { value: stars.value, max: props.max }))
</script>

<template>
  <span
    role="img"
    :aria-label="label"
    :title="label"
    class="relative inline-block h-[1.5em] text-xs align-middle"
    :style="{ width: `${1.5 * max}em` }"
  >
    <span
      class="absolute inset-0 bg-disabled-500 star-mask-outline"
      aria-hidden="true"
    />
    <span
      class="absolute inset-y-0 left-0 bg-black star-mask-filled"
      :style="{ width: `${1.5 * stars}em` }"
      aria-hidden="true"
    />
  </span>
</template>
