<script setup lang="ts">
import type { SeoEntity } from '~/utils/buildSEOHelper';
import { useCategory } from '../composables/useCategory';

const route = useRoute();
const cleanFullPath = computed(() => route?.fullPath?.replace(/\/$/, ''))
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

await loadCategory({ slug: route.path });

const uiBreadcrumbs = computed(() =>
  (breadcrumbs.value ?? []).map((b: any) => ({
    label: b.label,
    link: b.link,
  })),
)
</script>

<template>
  <div>
    <UiProductListing
      :breadcrumbs="uiBreadcrumbs"
      :seo-entity="seoEntity"
      :heading="category?.name || ''"
      :description="category?.metaDescription || ''"
      :items-per-page="18"
      state-key="category"
    />

    <!-- Merchant content, below the listing. Everything above is business
         logic and stays in code; this is the one place a block can go. -->
    <CmsRegion name="category-after" />
  </div>
</template>
