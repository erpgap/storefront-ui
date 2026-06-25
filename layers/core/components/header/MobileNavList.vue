<script lang="ts" setup>
import type { Category } from '~~/graphql'

defineEmits<{
  navigate: []
}>()

const categories = inject<Category[]>('categoriesForMegaMenu')
</script>

<template>
  <nav :aria-label="$t('navigationMenu')">
    <ul class="p-6 px-4 flex flex-col">
      <li
        v-for="category in categories"
        :key="category.id"
      >
        <HeaderMobileNavLink
          :to="category.slug"
          :label="category.name"
          @navigate="$emit('navigate')"
        />
      </li>
    </ul>
  </nav>
</template>
