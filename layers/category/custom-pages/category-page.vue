<script setup lang="ts">
import { useUiHelpers } from '../../category/composables/useUiHelpers';
import type { SeoEntity } from '~/utils/buildSEOHelper';
import { useCategory } from '../composables/useCategory';
import { useRoute } from 'vue-router';

const route = useRoute();
const cleanFullPath = computed(() => route?.fullPath?.replace(/\/$/, ''))
const { getFacetsFromURL } = useUiHelpers();
const { category, loadCategory, breadcrumbs } = useCategory(String(cleanFullPath.value));

const seoEntity = computed<SeoEntity>(() => {
  if (category.value && Object.keys(category.value).length > 0) {
    return category.value as SeoEntity;
  }

  return {
    name: 'Category',
    metaTitle: `Category | ${route.path.split('/').pop() || 'Products'}`,
    metaDescription: 'Browse our product categories',
  };
});

const facets = getFacetsFromURL(route.query);
if (facets.filter?.categorySlug) {
  await loadCategory({ slug: facets.filter.categorySlug });
}

const uiBreadcrumbs = computed(() =>
  (breadcrumbs.value ?? []).map((b: any) => ({
    label: b.label,
    link: b.link,
  })),
)
</script>

<template>
  <UiProductListing
    :breadcrumbs="uiBreadcrumbs"
    :seo-entity="seoEntity"
    :items-per-page="20"
    state-key="category"
  />
</template>
