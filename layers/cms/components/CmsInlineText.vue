<script setup lang="ts">
// A run of text with inline links, as parsed by utils/richText. Internal paths
// go through NuxtLink; parseInline has already dropped any unsafe target.
import type { Inline } from '../utils/richText'

defineProps<{ parts: Inline[] }>()

const NuxtLink = resolveComponent('NuxtLink')
const isInternal = (href: string) => href.startsWith('/')
</script>

<template>
  <!-- Kept on one line per node: a line break inside an <a> renders as a
       space, which would underline it and push punctuation away ("FAQ ."). -->
  <!-- eslint-disable vue/singleline-html-element-content-newline, vue/multiline-html-element-content-newline -->
  <template
    v-for="(part, index) in parts"
    :key="index"
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
</template>
