<script setup lang="ts">
import { useCategory } from '../composables/useCategory'
import type { SeoEntity } from '~/utils/buildSEOHelper'

const route = useRoute()
const { t } = useI18n()
const cleanFullPath = computed(() => route?.fullPath?.replace(/\/$/, ''))
const { category, loadCategory, breadcrumbs } = useCategory(String(cleanFullPath.value))

const seoEntity = computed<SeoEntity>(() => {
  if (category.value && Object.keys(category.value).length > 0) {
    return category.value as SeoEntity
  }

  return {
    name: 'Category',
    metaTitle: t('shop.category.metaTitleWithSlug', { slug: route.path.split('/').pop() || t('products') }),
    metaDescription: t('shop.category.metaDescriptionFallback'),
  }
})

await loadCategory({ slug: route.path })

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
    />

    <!-- Merchant content, below the listing. Everything above is business
         logic and stays in code; this is the one place a block can go. -->
    <CmsRegion name="category-after" />
  </div>
</template>
